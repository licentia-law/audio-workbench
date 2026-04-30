import shutil
import uuid
from pathlib import Path

from app.core.config import settings


class TempManager:
    def __init__(self):
        self.session_id: str = str(uuid.uuid4())
        self.session_root: Path = Path(settings.temp_root) / self.session_id

    def initialize(self) -> None:
        for subdir in ("uploads", "waveform", "renders", "stems"):
            (self.session_root / subdir).mkdir(parents=True, exist_ok=True)

    def get_path(self, subdir: str) -> Path:
        return self.session_root / subdir

    def cleanup(self) -> None:
        if self.session_root.exists():
            shutil.rmtree(self.session_root, ignore_errors=True)


temp_manager = TempManager()
