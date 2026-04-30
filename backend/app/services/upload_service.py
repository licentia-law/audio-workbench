import asyncio
import json
import uuid
from pathlib import Path
from typing import Optional

from app.core.config import settings
from app.core.errors import AppError, FILE_TOO_LONG, FFPROBE_ERROR
from app.core.temp_manager import temp_manager


class UploadService:
    def __init__(self):
        self._meta_store: dict[str, dict] = {}

    async def save_and_validate(self, content: bytes, original_filename: str) -> dict:
        file_id = str(uuid.uuid4())
        dest = temp_manager.get_path("uploads") / f"{file_id}.mp3"
        dest.write_bytes(content)

        try:
            duration = await self._probe_duration_file(dest)
        except AppError:
            dest.unlink(missing_ok=True)
            raise

        if duration > settings.max_duration_seconds:
            dest.unlink(missing_ok=True)
            raise AppError(FILE_TOO_LONG, "파일 길이는 10분 이하여야 합니다.")

        self._meta_store[file_id] = {
            "file_id": file_id,
            "original_name": original_filename,
            "size_bytes": len(content),
            "duration_seconds": duration,
            "path": str(dest),
        }

        return {
            "file_id": file_id,
            "original_name": original_filename,
            "size_bytes": len(content),
            "duration_seconds": duration,
        }

    def get_meta(self, file_id: str) -> Optional[dict]:
        meta = self._meta_store.get(file_id)
        if not meta:
            return None
        return {
            "file_id": file_id,
            "original_name": meta["original_name"],
            "size_bytes": meta["size_bytes"],
            "duration_seconds": meta["duration_seconds"],
        }

    async def get_waveform(self, file_id: str) -> Optional[dict]:
        meta = self._meta_store.get(file_id)
        if not meta:
            return None

        waveform_path = temp_manager.get_path("waveform") / f"{file_id}.json"

        if not waveform_path.exists():
            peaks = await self._extract_waveform(Path(meta["path"]), waveform_path)
        else:
            peaks = json.loads(waveform_path.read_text())

        return {"file_id": file_id, "peaks": peaks}

    async def _probe_duration_file(self, path: Path) -> float:
        proc = await asyncio.create_subprocess_exec(
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            str(path),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()

        if proc.returncode != 0:
            raise AppError(FFPROBE_ERROR, "파일 정보를 읽을 수 없습니다.")

        info = json.loads(stdout)
        return float(info["format"]["duration"])

    async def _extract_waveform(self, source: Path, out_path: Path) -> list[float]:
        proc = await asyncio.create_subprocess_exec(
            "ffmpeg",
            "-i", str(source),
            "-ac", "1",
            "-filter:a", "aresample=8000",
            "-map", "0:a",
            "-c:a", "pcm_s16le",
            "-f", "data",
            "pipe:1",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )
        stdout, _ = await proc.communicate()

        samples = []
        for i in range(0, len(stdout) - 1, 2):
            val = int.from_bytes(stdout[i:i+2], "little", signed=True)
            samples.append(val / 32768.0)

        # Downsample to ~1000 peaks
        bucket = max(1, len(samples) // 1000)
        peaks = []
        for i in range(0, len(samples), bucket):
            chunk = samples[i:i+bucket]
            peaks.append(max(abs(v) for v in chunk) if chunk else 0.0)

        out_path.write_text(json.dumps(peaks))
        return peaks


upload_service = UploadService()
