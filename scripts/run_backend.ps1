# Audio Workbench - Backend 실행 스크립트
Set-Location "$PSScriptRoot\..\backend"

if (-not (Test-Path ".venv")) {
    Write-Host "가상환경 생성 중..." -ForegroundColor Cyan
    python -m venv .venv
}

Write-Host "가상환경 활성화..." -ForegroundColor Cyan
& ".venv\Scripts\Activate.ps1"

Write-Host "패키지 설치 중..." -ForegroundColor Cyan
pip install -r requirements.txt --quiet

Write-Host "백엔드 서버 시작 (http://localhost:8000)" -ForegroundColor Green
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
