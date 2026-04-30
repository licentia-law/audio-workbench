from fastapi import APIRouter
from pydantic import BaseModel

from app.api.schemas.response import ApiResponse
from app.core.errors import AppError, FILE_NOT_FOUND, FFPROBE_ERROR, INVALID_CUT_RANGE
from app.services.cut_service import cut_mp3
from app.services.upload_service import upload_service

router = APIRouter(tags=["cut"])


class CutRequest(BaseModel):
    file_id: str
    start_sec: float
    end_sec: float


@router.post("/cut")
async def cut_audio(body: CutRequest) -> ApiResponse:
    meta = upload_service.get_meta(body.file_id)
    if not meta:
        raise AppError(FILE_NOT_FOUND, "파일을 찾을 수 없습니다.", status_code=404)

    duration: float = meta["duration_seconds"]

    if not (0 <= body.start_sec < body.end_sec <= duration + 0.001):
        raise AppError(INVALID_CUT_RANGE, "유효하지 않은 구간입니다. 시작 시점은 종료 시점보다 앞서야 합니다.")

    if body.end_sec - body.start_sec < 1.0:
        raise AppError(INVALID_CUT_RANGE, "선택 구간이 너무 짧습니다. 1초 이상 선택해 주세요.")

    input_path = upload_service.get_audio_path(body.file_id)
    if not input_path:
        raise AppError(FILE_NOT_FOUND, "파일을 찾을 수 없습니다.", status_code=404)

    try:
        result = await cut_mp3(
            meta["original_name"],
            input_path,
            body.start_sec,
            body.end_sec,
        )
    except RuntimeError:
        raise AppError(FFPROBE_ERROR, "자르기 처리에 실패했습니다. 다른 파일로 다시 시도해 주세요.")

    return ApiResponse.success(result, "자르기 완료")
