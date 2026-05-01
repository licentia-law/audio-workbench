import asyncio
import json
import subprocess
import uuid
from pathlib import Path

from app.core import artifact_registry
from app.core.filename_policy import amp_filename
from app.core.temp_manager import temp_manager


async def amplify_mp3(
    original_name: str,
    input_path: Path,
    gain_db: float,
    anti_clip: bool,
) -> dict:
    artifact_id = f"{uuid.uuid4()}.mp3"
    suggested = amp_filename(original_name, gain_db)
    output_path = temp_manager.get_path("renders") / artifact_id

    # Build ffmpeg filter chain
    # volume filter applies gain; alimiter prevents hard clipping when anti_clip=True
    volume_filter = f"volume={gain_db:.2f}dB"
    if anti_clip:
        filter_chain = f"{volume_filter},alimiter=limit=0.95:attack=5:release=50:level_in=1:level_out=1"
    else:
        filter_chain = volume_filter

    result = await asyncio.to_thread(
        subprocess.run,
        [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-af", filter_chain,
            "-codec:a", "libmp3lame",
            str(output_path),
        ],
        capture_output=True,
    )

    if result.returncode != 0:
        raise RuntimeError("ffmpeg amplify failed")

    # Measure output loudness via volumedetect
    stats = await _measure_loudness(output_path)

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
        "rms_dbfs": stats.get("rms_dbfs"),
        "peak_dbfs": stats.get("peak_dbfs"),
    }


async def _measure_loudness(path: Path) -> dict:
    """Run ffmpeg volumedetect and return rms_dbfs / peak_dbfs."""
    result = await asyncio.to_thread(
        subprocess.run,
        [
            "ffmpeg", "-y",
            "-i", str(path),
            "-af", "volumedetect",
            "-f", "null", "-",
        ],
        capture_output=True,
        text=True,
    )
    # volumedetect writes to stderr
    stderr = result.stderr

    rms_dbfs: float | None = None
    peak_dbfs: float | None = None

    for line in stderr.splitlines():
        if "mean_volume" in line:
            try:
                rms_dbfs = float(line.split("mean_volume:")[-1].strip().split()[0])
            except Exception:
                pass
        if "max_volume" in line:
            try:
                peak_dbfs = float(line.split("max_volume:")[-1].strip().split()[0])
            except Exception:
                pass

    return {"rms_dbfs": rms_dbfs, "peak_dbfs": peak_dbfs}
