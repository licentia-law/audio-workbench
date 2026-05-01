from fastapi import APIRouter
from pydantic import BaseModel

from app.api.schemas.response import ApiResponse
from app.core.errors import AppError, FILE_NOT_FOUND, ANALYSIS_FAILED
from app.services.analysis_service import analyze_audio
from app.services.upload_service import upload_service

router = APIRouter(tags=["analyze"])


class AnalyzeRequest(BaseModel):
    file_id: str


@router.post("/analyze")
async def analyze_audio_route(body: AnalyzeRequest) -> ApiResponse:
    meta = upload_service.get_meta(body.file_id)
    if not meta:
        raise AppError(FILE_NOT_FOUND, "파일을 찾을 수 없습니다.", status_code=404)

    input_path = upload_service.get_audio_path(body.file_id)
    if not input_path:
        raise AppError(FILE_NOT_FOUND, "파일을 찾을 수 없습니다.", status_code=404)

    try:
        result = await analyze_audio(input_path)
    except Exception:
        raise AppError(ANALYSIS_FAILED, "음원 분석에 실패했습니다. 다른 파일로 다시 시도해 주세요.")

    data = {
        "key": {
            "pretty": result.key.pretty,
            "tonic": result.key.tonic,
            "mode": result.key.mode,
            "confidence": result.key.confidence,
            "unknown": result.key.unknown,
        },
        "bpm": {
            "bpm": result.bpm.bpm,
            "confidence": result.bpm.confidence,
            "unknown": result.bpm.unknown,
        },
        "loudness": {
            "peak_db": result.loudness.peak_db,
            "rms_db": result.loudness.rms_db,
        },
        "duration_seconds": result.duration_seconds,
    }

    return ApiResponse.success(data, "분석 완료")
