"""
analysis_service.py — librosa 기반 5단계 음원 분석
모든 librosa/numpy 호출은 asyncio.to_thread로 감싼다 (Windows asyncio + CPU blocking).
"""
import asyncio
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class KeyResult:
    pretty: str           # "A minor", "F# Major", "Unknown"
    tonic: Optional[str]  # "A"
    mode: Optional[str]   # "major" | "minor"
    confidence: float     # 0..1
    unknown: bool


@dataclass
class BpmResult:
    bpm: Optional[float]  # 128.0
    confidence: float     # 0..1
    unknown: bool


@dataclass
class LoudnessResult:
    peak_db: float        # -1.4
    rms_db: float         # -14.8


@dataclass
class AnalysisResult:
    key: KeyResult
    bpm: BpmResult
    loudness: LoudnessResult
    duration_seconds: float


# ---------------------------------------------------------------------------
# Krumhansl-Schmuckler key profiles
# ---------------------------------------------------------------------------
_KS_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
_KS_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
_NOTE_PRETTY = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']


def _ks_correlation(chroma_mean: list, profile: list) -> float:
    """피어슨 상관계수로 조성 프로파일과 chroma 유사도 계산."""
    import numpy as np
    c = np.array(chroma_mean, dtype=float)
    p = np.array(profile, dtype=float)
    c -= c.mean(); p -= p.mean()
    denom = (np.std(c) * np.std(p))
    if denom < 1e-9:
        return 0.0
    return float(np.dot(c, p) / (len(c) * denom))


def _detect_key_sync(y, sr) -> KeyResult:
    """동기(blocking) Key 추정 — asyncio.to_thread로 감싸서 호출할 것."""
    import numpy as np
    import librosa

    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, bins_per_octave=36)
    chroma_mean = chroma.mean(axis=1).tolist()  # 12-bin

    best_score = -999.0
    best_tonic = 0
    best_mode = "major"

    for i in range(12):
        rotated = chroma_mean[i:] + chroma_mean[:i]
        maj_score = _ks_correlation(rotated, _KS_MAJOR)
        min_score = _ks_correlation(rotated, _KS_MINOR)
        if maj_score > best_score:
            best_score = maj_score
            best_tonic = i
            best_mode = "major"
        if min_score > best_score:
            best_score = min_score
            best_tonic = i
            best_mode = "minor"

    # confidence: 상관계수를 0..1 범위로 정규화 (0.4 이상이면 신뢰 가능)
    confidence = max(0.0, min(1.0, (best_score + 1.0) / 2.0))
    unknown = confidence < 0.4

    tonic_name = _NOTE_PRETTY[best_tonic]
    if unknown:
        pretty = "Unknown"
        tonic_name_out = None
        mode_out = None
    else:
        mode_label = "Major" if best_mode == "major" else "minor"
        pretty = f"{tonic_name} {mode_label}"
        tonic_name_out = tonic_name
        mode_out = best_mode

    return KeyResult(
        pretty=pretty,
        tonic=tonic_name_out,
        mode=mode_out,
        confidence=round(confidence, 4),
        unknown=unknown,
    )


def _detect_bpm_sync(y, sr) -> BpmResult:
    """동기(blocking) BPM 추정 — asyncio.to_thread로 감싸서 호출할 것."""
    import librosa
    import numpy as np

    try:
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        bpm = float(np.asarray(tempo).item())
        # onset strength으로 confidence 추정
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        strength = float(np.mean(onset_env))
        # onset strength가 낮으면 신뢰도 낮음
        confidence = min(1.0, strength / 3.0)
        unknown = confidence < 0.3 or bpm < 40 or bpm > 300
        return BpmResult(
            bpm=round(bpm, 1) if not unknown else None,
            confidence=round(confidence, 4),
            unknown=unknown,
        )
    except Exception:
        return BpmResult(bpm=None, confidence=0.0, unknown=True)


def _measure_loudness_sync(y) -> LoudnessResult:
    """동기(blocking) 음량 측정 — asyncio.to_thread로 감싸서 호출할 것."""
    import numpy as np
    import librosa

    peak = float(np.max(np.abs(y)))
    rms = float(np.sqrt(np.mean(y ** 2)))

    peak_db = float(librosa.amplitude_to_db(np.array([peak]))[0]) if peak > 0 else -120.0
    rms_db = float(librosa.amplitude_to_db(np.array([rms]))[0]) if rms > 0 else -120.0

    return LoudnessResult(
        peak_db=round(peak_db, 1),
        rms_db=round(rms_db, 1),
    )


async def analyze_audio(path: Path) -> AnalysisResult:
    """
    mp3 파일을 librosa로 분석한다.
    모든 CPU-blocking 작업은 asyncio.to_thread로 감싼다.
    key/bpm 부분 실패 허용 — unknown=True로 fall-through.
    decode/loudness 실패는 예외 그대로 전파.
    """
    import librosa

    # 1. 디코딩 (blocking)
    y, sr = await asyncio.to_thread(librosa.load, str(path), sr=22050, mono=True)
    duration = float(len(y)) / sr

    # 2. Key 추정 (blocking, 부분 실패 허용)
    try:
        key_result = await asyncio.to_thread(_detect_key_sync, y, sr)
    except Exception:
        key_result = KeyResult(
            pretty="Unknown", tonic=None, mode=None, confidence=0.0, unknown=True
        )

    # 3. BPM 추정 (blocking, 부분 실패 허용)
    try:
        bpm_result = await asyncio.to_thread(_detect_bpm_sync, y, sr)
    except Exception:
        bpm_result = BpmResult(bpm=None, confidence=0.0, unknown=True)

    # 4. 음량 측정 (blocking)
    loudness_result = await asyncio.to_thread(_measure_loudness_sync, y)

    return AnalysisResult(
        key=key_result,
        bpm=bpm_result,
        loudness=loudness_result,
        duration_seconds=round(duration, 3),
    )
