# Audio Workbench

개인용 브라우저 기반 음원 편집 도구. mp3 파일을 업로드해 자르기, 분석, 키 변환, 음량 증폭, 스템 분리/믹스를 수행한다.

---

## 환경

| 항목 | 버전 |
|---|---|
| Node | 24 |
| Python | 3.11+ |
| ffmpeg / ffprobe | PATH 등록 필수 |
| Demucs | `pip install demucs` (스템 분리 기능) |

```powershell
# ffprobe 확인
ffprobe -version

# demucs 확인
python -m demucs --help
```

---

## 실행

```powershell
# 백엔드 먼저 (port 8000)
.\scripts\run_backend.ps1

# 프론트엔드 (port 5173)
.\scripts\run_frontend.ps1
```

브라우저에서 `http://localhost:5173` 접속.

> 백엔드 재시작 시 업로드 파일과 세션 초기화됨 (temp/ 폴더 자동 삭제).

---

## 기능

| 페이지 | 기능 | 처리 엔진 |
|---|---|---|
| 음원 자르기 | 구간 선택 후 mp3 저장 | ffmpeg |
| 음원 분석 | Key / BPM / 음량(dBFS) | librosa |
| Key 변환 | ±12 반음, 템포 유지 | ffmpeg rubberband 내장 필터 |
| 음량 증폭 | -20 ~ +20 dB, Anti-Clip 옵션 | ffmpeg + alimiter |
| 스템 분리/믹스 | vocals · drums · bass · other 4채널 분리, 채널별 음량 조절 후 Mixed mp3 다운로드 | Demucs htdemucs + ffmpeg amix |

---

## 제한

- 파일 형식: mp3 only
- 최대 길이: 10분
- 최대 크기: 20MB

---

## 구조

```
audio-workbench/
├── backend/          # FastAPI (port 8000)
│   └── app/
│       ├── api/routes/
│       ├── core/
│       └── services/
├── frontend/         # React + Vite (port 5173)
│   └── src/
│       ├── pages/
│       ├── components/
│       └── hooks/
├── scripts/          # run_backend.ps1 / run_frontend.ps1
└── docs/             # PRD, DTL, 디자인 문서
```

---

## 초기 설치

```powershell
# Python 가상환경 + 패키지
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt

# 프론트엔드 패키지
cd frontend
npm install
```
