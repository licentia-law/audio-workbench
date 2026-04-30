from fastapi import APIRouter

from app.api.schemas.response import ApiResponse
from app.core.errors import AppError, FILE_NOT_FOUND
from app.services.upload_service import upload_service

router = APIRouter(tags=["file"])


@router.get("/file/{file_id}/meta")
async def get_file_meta(file_id: str) -> ApiResponse:
    meta = upload_service.get_meta(file_id)
    if meta is None:
        raise AppError(FILE_NOT_FOUND, "파일을 찾을 수 없습니다.", status_code=404)
    return ApiResponse.success(meta)


@router.get("/file/{file_id}/waveform")
async def get_waveform(file_id: str) -> ApiResponse:
    data = await upload_service.get_waveform(file_id)
    if data is None:
        raise AppError(FILE_NOT_FOUND, "파일을 찾을 수 없습니다.", status_code=404)
    return ApiResponse.success(data)
