from fastapi import APIRouter, UploadFile, File

from app.api.schemas.response import ApiResponse
from app.core.config import settings
from app.core.errors import AppError, INVALID_FILE_TYPE, FILE_TOO_LARGE
from app.services.upload_service import upload_service

router = APIRouter(tags=["upload"])


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)) -> ApiResponse:
    if not file.filename or not file.filename.lower().endswith(".mp3"):
        raise AppError(INVALID_FILE_TYPE, "mp3 파일만 업로드 가능합니다.")

    content = await file.read()

    if len(content) > settings.max_file_size_bytes:
        raise AppError(FILE_TOO_LARGE, "파일 크기는 20MB 이하여야 합니다.")

    result = await upload_service.save_and_validate(content, file.filename)
    return ApiResponse.success(result, "업로드 성공")
