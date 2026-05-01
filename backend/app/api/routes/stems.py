from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.api.schemas.response import ApiResponse
from app.core.errors import AppError, FILE_NOT_FOUND, STEM_SEPARATION_FAILED, STEM_MIX_FAILED
from app.services.upload_service import upload_service
from app.services.stem_service import separate_stems
from app.services.stem_mix_service import render_mix

router = APIRouter(tags=["stems"])


# ── POST /api/stems/separate ─────────────────────────────────────────────────

class StemSeparateRequest(BaseModel):
    file_id: str


@router.post("/separate")
async def separate_stems_endpoint(body: StemSeparateRequest) -> ApiResponse:
    meta = upload_service.get_meta(body.file_id)
    if not meta:
        raise AppError(FILE_NOT_FOUND, "파일을 찾을 수 없습니다.", status_code=404)

    input_path = upload_service.get_audio_path(body.file_id)
    if not input_path:
        raise AppError(FILE_NOT_FOUND, "오디오 파일을 찾을 수 없습니다.", status_code=404)

    stems = await separate_stems(
        file_id=body.file_id,
        input_path=input_path,
        original_name=meta["original_name"],
    )
    return ApiResponse.success({"stems": stems}, "스템 분리 완료")


# ── POST /api/stems/mix ──────────────────────────────────────────────────────

class StemMixRequest(BaseModel):
    stem_artifact_ids: dict[str, str]           # stem_id → artifact_id
    gain_db: dict[str, float] = Field(default_factory=dict)
    master_db: float = Field(default=0.0, ge=-24.0, le=12.0)
    active_stems: list[str]                     # 뮤트되지 않은 스템 ID 목록
    original_name: str


@router.post("/mix")
async def mix_stems_endpoint(body: StemMixRequest) -> ApiResponse:
    # gain_db 범위 검증
    for stem_id, db in body.gain_db.items():
        if not (-24.0 <= db <= 12.0):
            raise AppError(
                STEM_MIX_FAILED,
                f"'{stem_id}' 게인 값이 범위를 벗어났습니다 ({db} dB).",
            )

    result = await render_mix(
        stem_artifact_ids=body.stem_artifact_ids,
        gain_db=body.gain_db,
        master_db=body.master_db,
        active_stems=body.active_stems,
        original_name=body.original_name,
    )
    return ApiResponse.success(result, "믹스 렌더 완료")
