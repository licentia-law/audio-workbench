from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.errors import AppError
from app.core.temp_manager import temp_manager
from app.api.schemas.response import ApiResponse
from app.api.routes import upload, file, download, session, cut


@asynccontextmanager
async def lifespan(app: FastAPI):
    temp_manager.initialize()
    print(f"Session started: {temp_manager.session_id}")
    yield
    temp_manager.cleanup()
    print(f"Session cleaned up: {temp_manager.session_id}")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ApiResponse.failure(exc.code, exc.message).model_dump(),
    )


app.include_router(upload.router, prefix="/api")
app.include_router(file.router, prefix="/api")
app.include_router(download.router, prefix="/api")
app.include_router(session.router, prefix="/api")
app.include_router(cut.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"ok": True, "message": "ok", "data": {"session_id": temp_manager.session_id}, "error": None}
