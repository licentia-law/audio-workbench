from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.api.schemas.response import ApiResponse
from app.core.errors import AppError, FILE_NOT_FOUND, AMPLIFY_FAILED
from app.services.amplify_service import amplify_mp3
from app.services.upload_service import upload_service

router = APIRouter(tags=["amplify"])


class AmplifyRequest(BaseModel):
    file_id: str
    gain_db: float = Field(..., ge=-20.0, le=20.0)
    anti_clip: bool = True


@router.post("/amplify")
async def amplify_audio(body: AmplifyRequest) -> ApiResponse:
    meta = upload_service.get_meta(body.file_id)
    if not meta:
        raise AppError(FILE_NOT_FOUND, "파일을 찾을 수 없습니다.", status_code=404)

    input_path = upload_service.get_audio_path(body.file_id)
    if not input_path:
        raise AppError(FILE_NOT_FOUND, "파일을 찾을 수 없습니다.", status_code=404)

    try:
        result = await amplify_mp3(
            meta["original_name"],
            input_path,
            body.gain_db,
            body.anti_clip,
        )
    except RuntimeError:
        raise AppError(AMPLIFY_FAILED, "음량 처리에 실패했습니다. 다른 파일로 다시 시도해 주세요.")

    return ApiResponse.success(result, "음량 변환 완료")
