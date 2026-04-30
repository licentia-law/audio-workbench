# Audio Workbench - 세션 컨텍스트 빠른 확인 스크립트
# 실행: .\scripts\session_context.ps1

$root = "$PSScriptRoot\.."

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Audio Workbench - Session Context" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# --- 현재 진행 단계 ---
Write-Host ""
Write-Host "[현재 진행 단계]" -ForegroundColor Yellow
$phaseFile = "$root\docs\current_phase.md"
if (Test-Path $phaseFile) {
    $lines = Get-Content $phaseFile
    $inTable = $false
    foreach ($line in $lines) {
        if ($line -match "^\| 단계") { $inTable = $true }
        if ($inTable -and $line -match "^\|") {
            Write-Host $line
        }
        if ($inTable -and $line -notmatch "^\|") { $inTable = $false }
    }
} else {
    Write-Host "  current_phase.md 없음" -ForegroundColor Red
}

# --- 최근 세션 노트 ---
Write-Host ""
Write-Host "[최근 세션 노트]" -ForegroundColor Yellow
$notesFile = "$root\docs\session_notes.md"
if (Test-Path $notesFile) {
    $lines = Get-Content $notesFile
    $inLastSession = $false
    $printedHeader = $false
    foreach ($line in $lines) {
        if ($line -match "^### \d{4}-\d{2}-\d{2}") {
            if ($printedHeader) { break }
            $inLastSession = $true
            $printedHeader = $true
        }
        if ($inLastSession) {
            Write-Host "  $line"
        }
    }
} else {
    Write-Host "  session_notes.md 없음" -ForegroundColor Red
}

# --- 외부 도구 상태 ---
Write-Host ""
Write-Host "[외부 도구 상태]" -ForegroundColor Yellow

$tools = @(
    @{ name = "ffprobe"; cmd = "ffprobe -version" },
    @{ name = "ffmpeg";  cmd = "ffmpeg -version" }
)

foreach ($tool in $tools) {
    try {
        $null = Invoke-Expression "$($tool.cmd) 2>&1"
        Write-Host "  ✅ $($tool.name)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $($tool.name) — PATH 미등록 또는 미설치" -ForegroundColor Red
    }
}

# Node / npm
try {
    $nodeVer = node --version 2>&1
    Write-Host "  ✅ node $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "  ❌ node 미설치" -ForegroundColor Red
}

# Python
try {
    $pyVer = python --version 2>&1
    Write-Host "  ✅ $pyVer" -ForegroundColor Green
} catch {
    Write-Host "  ❌ python 미설치" -ForegroundColor Red
}

# --- 백엔드 가상환경 ---
Write-Host ""
Write-Host "[백엔드 가상환경]" -ForegroundColor Yellow
$venvPath = "$root\backend\.venv"
if (Test-Path $venvPath) {
    Write-Host "  ✅ backend/.venv 존재" -ForegroundColor Green
} else {
    Write-Host "  ❌ backend/.venv 없음 — run_backend.ps1 실행 시 자동 생성됨" -ForegroundColor DarkYellow
}

# --- 프론트엔드 의존성 ---
Write-Host ""
Write-Host "[프론트엔드 의존성]" -ForegroundColor Yellow
$nmPath = "$root\frontend\node_modules"
if (Test-Path $nmPath) {
    Write-Host "  ✅ frontend/node_modules 존재" -ForegroundColor Green
} else {
    Write-Host "  ❌ frontend/node_modules 없음 — run_frontend.ps1 실행 시 자동 설치됨" -ForegroundColor DarkYellow
}

# --- 실행 방법 안내 ---
Write-Host ""
Write-Host "[실행 방법]" -ForegroundColor Yellow
Write-Host "  백엔드:     .\scripts\run_backend.ps1"
Write-Host "  프론트엔드: .\scripts\run_frontend.ps1"
Write-Host "  백엔드 URL: http://127.0.0.1:8000"
Write-Host "  프론트 URL: http://localhost:5173"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
