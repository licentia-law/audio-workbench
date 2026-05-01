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
