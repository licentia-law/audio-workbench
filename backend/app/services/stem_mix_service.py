"""
stem_mix_service.py — 선택된 스템들을 ffmpeg amix로 합산 후 mp3 출력

필터 체인: 각 스템에 volume={linear} 적용 → amix=inputs=N:normalize=0 → master volume
"""
import asyncio
import json
import math
import subprocess
import uuid
from pathlib import Path

from app.core import artifact_registry
from app.core.errors import AppError, STEM_MIX_FAILED
from app.core.filename_policy import mix_filename
from app.core.temp_manager import temp_manager


def _db_to_linear(db: float) -> float:
    """dB → linear amplitude.  db ≤ -24 → 0 (silence)."""
    if db <= -24.0:
        return 0.0
    return math.pow(10.0, db / 20.0)


async def render_mix(
    stem_artifact_ids: dict[str, str],   # stem_id → artifact_id
    gain_db: dict[str, float],           # stem_id → gainDb
    master_db: float,
    active_stems: list[str],             # 뮤트되지 않은 스템 ID 목록
    original_name: str,
) -> dict:
    """
    active_stems 목록에 있는 스템들을 gain 적용 후 amix로 합산.
    Returns: { artifact_id, suggested_filename, size_bytes, duration_sec }
    """
    if not active_stems:
        raise AppError(STEM_MIX_FAILED, "활성 스템이 없습니다. 하나 이상의 채널을 활성화하세요.")

    renders_dir = temp_manager.get_path("renders")

    # 각 스템 mp3 경로 확인
    stem_paths: list[tuple[str, Path]] = []
    for stem_id in active_stems:
        art_id = stem_artifact_ids.get(stem_id)
        if not art_id:
            raise AppError(STEM_MIX_FAILED, f"'{stem_id}' 아티팩트 ID가 없습니다.")
        p = renders_dir / art_id
        if not p.exists():
            raise AppError(STEM_MIX_FAILED, f"'{stem_id}' 파일을 찾을 수 없습니다.")
        stem_paths.append((stem_id, p))

    n = len(stem_paths)

    # ffmpeg 명령어 빌드
    # -i stem1.mp3 -i stem2.mp3 ...
    # -filter_complex "[0:a]volume={g0}[a0];[1:a]volume={g1}[a1];...;[a0]...[aN-1]amix=inputs=N:normalize=0[mix];[mix]volume={master}[out]"
    # -map "[out]" -codec:a libmp3lame -b:a 192k output.mp3
    cmd: list[str] = ["ffmpeg", "-y"]
    for _, p in stem_paths:
        cmd += ["-i", str(p)]

    filter_parts: list[str] = []
    label_refs: list[str] = []
    for i, (stem_id, _) in enumerate(stem_paths):
        g = _db_to_linear(gain_db.get(stem_id, 0.0))
        label = f"a{i}"
        filter_parts.append(f"[{i}:a]volume={g:.6f}[{label}]")
        label_refs.append(f"[{label}]")

    # amix
    mix_label = "mix"
    filter_parts.append(
        f"{''.join(label_refs)}amix=inputs={n}:normalize=0[{mix_label}]"
    )

    # master gain
    master_g = _db_to_linear(master_db)
    filter_parts.append(f"[{mix_label}]volume={master_g:.6f}[out]")

    filter_complex = ";".join(filter_parts)
    cmd += ["-filter_complex", filter_complex, "-map", "[out]"]
    cmd += ["-codec:a", "libmp3lame", "-b:a", "192k"]

    artifact_id = f"{uuid.uuid4()}.mp3"
    output_path = renders_dir / artifact_id
    cmd.append(str(output_path))

    result = await asyncio.to_thread(
        subprocess.run,
        cmd,
        capture_output=True,
    )
    if result.returncode != 0:
        raise AppError(STEM_MIX_FAILED, "믹스 렌더에 실패했습니다.")

    suggested = mix_filename(original_name)
    size_bytes = output_path.stat().st_size
    duration_sec = await _probe_duration(output_path)

    artifact_registry.register(artifact_id, suggested)

    return {
        "artifact_id": artifact_id,
        "suggested_filename": suggested,
        "size_bytes": size_bytes,
        "duration_sec": duration_sec,
    }


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
