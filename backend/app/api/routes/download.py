from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.core import artifact_registry
from app.core.errors import AppError, FILE_NOT_FOUND
from app.core.temp_manager import temp_manager

router = APIRouter(tags=["download"])


@router.get("/download/{artifact_id}")
async def download_artifact(artifact_id: str):
    renders_dir = temp_manager.get_path("renders")
    target = renders_dir / artifact_id

    if not target.exists():
        raise AppError(FILE_NOT_FOUND, "결과 파일을 찾을 수 없습니다.", status_code=404)

    suggested = artifact_registry.get_filename(artifact_id) or artifact_id

    return FileResponse(
        path=str(target),
        media_type="audio/mpeg",
        filename=suggested,
    )
