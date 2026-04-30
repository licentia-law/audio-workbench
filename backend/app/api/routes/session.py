from fastapi import APIRouter

from app.api.schemas.response import ApiResponse
from app.core.errors import AppError, SESSION_NOT_FOUND
from app.core.temp_manager import temp_manager

router = APIRouter(tags=["session"])


@router.delete("/session/{session_id}")
async def delete_session(session_id: str) -> ApiResponse:
    if session_id != temp_manager.session_id:
        raise AppError(SESSION_NOT_FOUND, "세션을 찾을 수 없습니다.", status_code=404)

    temp_manager.cleanup()
    return ApiResponse.success({"session_id": session_id}, "세션이 삭제되었습니다.")
