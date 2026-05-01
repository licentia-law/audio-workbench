"""
stem_service.py — Demucs 4-stem separation (--mp3 직접 출력)

Demucs 실행: sys.executable -m demucs -n htdemucs --mp3 --out {stems_dir} {input_path}
출력 경로:  {stems_dir}/htdemucs/{file_id_stem}/{stem_id}.mp3
            (lameenc 사용, torchaudio.save 우회 → torchcodec 불필요)
"""
import asyncio
import json
import shutil
import subprocess
import sys
import uuid
from pathlib import Path

from app.core import artifact_registry
from app.core.errors import AppError, STEM_SEPARATION_FAILED
from app.core.filename_policy import stem_filename
from app.core.temp_manager import temp_manager

STEM_IDS = ("vocals", "drums", "bass", "other")


async def separate_stems(
    file_id: str,
    input_path: Path,
    original_name: str,
) -> dict:
    """
    Demucs --mp3 로 4-stem 분리 (lameenc 직접 출력, torchaudio.save 우회).
    Returns: { stem_id: { artifact_id, suggested_filename, size_bytes, duration_sec }, ... }
    """
    stems_base = temp_manager.get_path("stems")
    renders_dir = temp_manager.get_path("renders")

    # --mp3: lameenc으로 직접 mp3 저장 → torchaudio.save(torchcodec) 우회
    result = await asyncio.to_thread(
        subprocess.run,
        [
            sys.executable, "-m", "demucs",
            "-n", "htdemucs",
            "--mp3",
            "--out", str(stems_base),
            str(input_path),
        ],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        stderr_snippet = (result.stderr or "")[-400:]
        raise AppError(
            STEM_SEPARATION_FAILED,
            f"스템 분리에 실패했습니다. ({stderr_snippet})",
        )

    # Demucs --mp3 output: {stems_base}/htdemucs/{file_stem}/{stem_id}.mp3
    file_stem = Path(input_path).stem
    stem_src_dir = stems_base / "htdemucs" / file_stem

    if not stem_src_dir.exists():
        raise AppError(STEM_SEPARATION_FAILED, "스템 출력 폴더를 찾을 수 없습니다.")

    out: dict[str, dict] = {}
    for stem_id in STEM_IDS:
        src_mp3 = stem_src_dir / f"{stem_id}.mp3"
        if not src_mp3.exists():
            raise AppError(STEM_SEPARATION_FAILED, f"'{stem_id}' 스템 파일이 없습니다.")

        artifact_id = f"{uuid.uuid4()}.mp3"
        mp3_path = renders_dir / artifact_id
        suggested = stem_filename(original_name, stem_id)

        await asyncio.to_thread(shutil.copy2, str(src_mp3), str(mp3_path))

        size_bytes = mp3_path.stat().st_size
        duration_sec = await _probe_duration(mp3_path)

        artifact_registry.register(artifact_id, suggested)
        out[stem_id] = {
            "artifact_id": artifact_id,
            "suggested_filename": suggested,
            "size_bytes": size_bytes,
            "duration_sec": duration_sec,
        }

    return out


async def _probe_duration(path: Path) -> float:
    probe = await asyncio.to_thread(
        subprocess.run,
        [
            "ffprobe", "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            str(path),
        ],
        capture_output=True,
        text=True,
    )
    if probe.returncode != 0:
        return 0.0
    try:
        info = json.loads(probe.stdout)
        return round(float(info["format"]["duration"]), 3)
    except Exception:
        return 0.0
