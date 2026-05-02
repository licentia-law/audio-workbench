from fastapi import APIRouter
from typing import Literal

from pydantic import BaseModel, Field

from app.api.schemas.response import ApiResponse
from app.core.errors import AppError, FILE_NOT_FOUND, KEY_SHIFT_FAILED
from app.services.key_shift_service import key_shift_mp3
from app.services.upload_service import upload_service

router = APIRouter(tags=["key-shift"])


class KeyShiftRequest(BaseModel):
    file_id: str
    semitones: int = Field(..., ge=-12, le=12)
    tonic_idx: int | None = None   # 0..11 (C..B), null = Unknown
    mode: str | None = None        # 'Major' | 'minor', null = Unknown
    transients: Literal["smooth", "crisp"] = "smooth"


@router.post("/key-shift")
async def key_shift_audio(body: KeyShiftRequest) -> ApiResponse:
    if body.semitones == 0:
        raise AppError(KEY_SHIFT_FAILED, "반음 값이 0입니다. 변환할 반음 수를 설정하세요.")

    meta = upload_service.get_meta(body.file_id)
    if not meta:
        raise AppError(FILE_NOT_FOUND, "파일을 찾을 수 없습니다.", status_code=404)

    input_path = upload_service.get_audio_path(body.file_id)
    if not input_path:
        raise AppError(FILE_NOT_FOUND, "파일을 찾을 수 없습니다.", status_code=404)

    try:
        result = await key_shift_mp3(
            original_name=meta["original_name"],
            input_path=input_path,
            semitones=body.semitones,
            tonic_idx=body.tonic_idx,
            mode=body.mode,
            transients=body.transients,
        )
    except RuntimeError:
        raise AppError(KEY_SHIFT_FAILED, "Key 변환 처리에 실패했습니다. 다른 파일로 다시 시도해 주세요.")

    return ApiResponse.success(result, "Key 변환 완료")
