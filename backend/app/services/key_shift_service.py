import asyncio
import json
import subprocess
import uuid
from pathlib import Path

from app.core import artifact_registry
from app.core.filename_policy import key_shift_filename
from app.core.temp_manager import temp_manager


async def key_shift_mp3(
    original_name: str,
    input_path: Path,
    semitones: int,
    tonic_idx: int | None,
    mode: str | None,  # 'Major' | 'minor'
    transients: str = "smooth",  # 'smooth' | 'crisp'
) -> dict:
    pitch_scale = 2 ** (semitones / 12)
    artifact_id = f"{uuid.uuid4()}.mp3"
    suggested = key_shift_filename(original_name, semitones, tonic_idx, mode)
    output_path = temp_manager.get_path("renders") / artifact_id

    # ffmpeg built-in rubberband filter: pitch shift with tempo preservation
    result = await asyncio.to_thread(
        subprocess.run,
        [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-af", (
                f"rubberband=pitch={pitch_scale:.6f}"
                ":pitchq=quality"
                f":transients={transients}"
                ":phase=independent"
                ":window=long"
                ":smoothing=on"
                ":formant=preserved"
                ":channels=together"
            ),
            "-codec:a", "libmp3lame", "-q:a", "0",
            str(output_path),
        ],
        capture_output=True,
    )

    if result.returncode != 0:
        raise RuntimeError("ffmpeg key shift failed")

    size_bytes = output_path.stat().st_size

    # Measure duration via ffprobe
    probe = await asyncio.to_thread(
        subprocess.run,
        [
            "ffprobe", "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            str(output_path),
        ],
        capture_output=True,
        text=True,
    )
    duration_sec = 0.0
    if probe.returncode == 0:
        try:
            info = json.loads(probe.stdout)
            duration_sec = float(info.get("format", {}).get("duration", 0))
        except Exception:
            pass

    artifact_registry.register(artifact_id, suggested)

    return {
        "artifact_id": artifact_id,
        "suggested_filename": suggested,
        "duration_seconds": round(duration_sec, 3),
        "size_bytes": size_bytes,
    }
