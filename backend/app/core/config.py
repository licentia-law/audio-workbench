from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Audio Workbench API"
    app_version: str = "0.1.0"
    debug: bool = True

    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    max_file_size_bytes: int = 20 * 1024 * 1024  # 20MB
    max_duration_seconds: float = 900.0  # 15 minutes

    temp_root: str = "temp"

    class Config:
        env_file = ".env"


settings = Settings()
