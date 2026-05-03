import asyncio
import json
import subprocess
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
            probe = await self._probe_file(dest)
        except AppError:
            dest.unlink(missing_ok=True)
            raise

        duration = probe["duration_seconds"]
        if duration > settings.max_duration_seconds:
            dest.unlink(missing_ok=True)
            raise AppError(FILE_TOO_LONG, "파일 길이는 15분 이하여야 합니다.")

        self._meta_store[file_id] = {
            "file_id": file_id,
            "original_name": original_filename,
            "size_bytes": len(content),
            "duration_seconds": duration,
            "sample_rate": probe["sample_rate"],
            "bit_rate": probe["bit_rate"],
            "path": str(dest),
        }

        return {
            "file_id": file_id,
            "original_name": original_filename,
            "size_bytes": len(content),
            "duration_seconds": duration,
            "sample_rate": probe["sample_rate"],
            "bit_rate": probe["bit_rate"],
        }

    def get_audio_path(self, file_id: str) -> Optional[Path]:
        meta = self._meta_store.get(file_id)
        if meta is None:
            return None
        path = Path(meta["path"])
        return path if path.exists() else None

    def get_meta(self, file_id: str) -> Optional[dict]:
        meta = self._meta_store.get(file_id)
        if not meta:
            return None
        return {
            "file_id": file_id,
            "original_name": meta["original_name"],
            "size_bytes": meta["size_bytes"],
            "duration_seconds": meta["duration_seconds"],
            "sample_rate": meta.get("sample_rate"),
            "bit_rate": meta.get("bit_rate"),
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

    async def _probe_file(self, path: Path) -> dict:
        result = await asyncio.to_thread(
            subprocess.run,
            [
                "ffprobe", "-v", "quiet", "-print_format", "json",
                "-show_format", "-show_streams", str(path),
            ],
            capture_output=True,
        )

        if result.returncode != 0:
            raise AppError(FFPROBE_ERROR, "파일 정보를 읽을 수 없습니다.")

        info = json.loads(result.stdout)
        duration = float(info["format"]["duration"])

        sample_rate: Optional[int] = None
        bit_rate: Optional[int] = None
        for stream in info.get("streams", []):
            if stream.get("codec_type") == "audio":
                sr = stream.get("sample_rate")
                br = stream.get("bit_rate") or info["format"].get("bit_rate")
                if sr is not None:
                    sample_rate = int(sr)
                if br is not None:
                    bit_rate = int(br)
                break

        return {
            "duration_seconds": duration,
            "sample_rate": sample_rate,
            "bit_rate": bit_rate,
        }

    async def _extract_waveform(self, source: Path, out_path: Path) -> list[float]:
        result = await asyncio.to_thread(
            subprocess.run,
            [
                "ffmpeg", "-i", str(source),
                "-ac", "1",
                "-filter:a", "aresample=8000",
                "-map", "0:a",
                "-c:a", "pcm_s16le",
                "-f", "data",
                "pipe:1",
            ],
            capture_output=True,
        )
        stdout = result.stdout

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
