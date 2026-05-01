import re


_ALLOWED = re.compile(r"[^\w가-힣\-]")


def sanitize_base_name(name: str) -> str:
    stem = name.rsplit(".", 1)[0] if "." in name else name
    sanitized = stem.replace(" ", "_")
    sanitized = _ALLOWED.sub("", sanitized)
    return sanitized or "file"


def with_suffix(original_name: str, suffix: str) -> str:
    base = sanitize_base_name(original_name)
    return f"{base}({suffix}).mp3"


def cut_filename(original_name: str) -> str:
    return with_suffix(original_name, "cut")


def amp_filename(original_name: str, gain_db: float) -> str:
    sign = "+" if gain_db >= 0 else ""
    formatted = f"{gain_db:.1f}".rstrip("0").rstrip(".")
    return with_suffix(original_name, f"{sign}{formatted}dB")


_SHARPS = ["C", "C_sharp", "D", "D_sharp", "E", "F", "F_sharp", "G", "G_sharp", "A", "A_sharp", "B"]
_FLATS  = ["C", "D_flat",  "D", "E_flat",  "E", "F", "G_flat",  "G", "A_flat",  "A", "B_flat",  "B"]


_STEM_LABELS = {"vocals": "vocals", "drums": "drums", "bass": "bass", "other": "other"}


def stem_filename(original_name: str, stem_id: str) -> str:
    """예: song(vocals).mp3 / song(drums).mp3"""
    return with_suffix(original_name, _STEM_LABELS.get(stem_id, stem_id))


def mix_filename(original_name: str) -> str:
    """예: song(mixed).mp3"""
    return with_suffix(original_name, "mixed")


def key_shift_filename(
    original_name: str,
    semitones: int,
    tonic_idx: int | None,
    mode: str | None,  # 'Major' | 'minor'
) -> str:
    if tonic_idx is not None and mode in ("Major", "minor"):
        new_idx = ((tonic_idx + semitones) % 12 + 12) % 12
        table = _FLATS if semitones < 0 else _SHARPS
        note = table[new_idx]
        suffix = f"{note}_{mode}"
    else:
        sign = "+" if semitones >= 0 else ""
        suffix = f"key_shift_{sign}{semitones}"
    return with_suffix(original_name, suffix)
