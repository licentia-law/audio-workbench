_registry: dict[str, str] = {}


def register(artifact_id: str, suggested_filename: str) -> None:
    _registry[artifact_id] = suggested_filename


def get_filename(artifact_id: str) -> str | None:
    return _registry.get(artifact_id)
