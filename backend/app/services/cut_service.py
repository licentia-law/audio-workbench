import asyncio
import subprocess
import uuid
from pathlib import Path

from app.core import artifact_registry
from app.core.filename_policy import cut_filename
from app.core.temp_manager import temp_manager


async def cut_mp3(
    original_name: str,
    input_path: Path,
    start_sec: float,
    end_sec: float,
) -> dict:
    duration = end_sec - start_sec
    artifact_id = f"{uuid.uuid4()}.mp3"
    suggested = cut_filename(original_name)
    output_path = temp_manager.get_path("renders") / artifact_id

    result = await asyncio.to_thread(
        subprocess.run,
        [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-ss", f"{start_sec:.3f}",
            "-t", f"{duration:.3f}",
            "-codec:a", "libmp3lame",
            str(output_path),
        ],
        capture_output=True,
    )

    if result.returncode != 0:
        raise RuntimeError("ffmpeg cut failed")

    artifact_registry.register(artifact_id, suggested)

    return {
        "artifact_id": artifact_id,
        "suggested_filename": suggested,
        "duration_seconds": round(duration, 3),
        "size_bytes": output_path.stat().st_size,
    }
