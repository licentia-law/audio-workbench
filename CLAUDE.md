# Audio Workbench — CLAUDE.md

프로젝트 컨텍스트 문서. 모든 Claude Code 세션은 이 파일을 기준으로 작업한다.

---

## 프로젝트 개요

개인용 브라우저 기반 음원 조정 프로그램 MVP.

- 구조: React SPA (port 5173) + FastAPI 로컬 백엔드 (port 8000)
- 입출력: mp3 only
- 업로드 제한: 10분 이하 / 20MB 이하
- 저장 정책: 세션 종료 후 영구 저장 없음 (로컬 temp만 사용)
- 대상 환경: Windows + Chrome 데스크톱

## 핵심 문서

| 문서 | 경로 |
|---|---|
| PRD | `docs/PRD_260430_1103.md` |
| DTL | `docs/DTL_260430_1433.md` |
| UI 와이어프레임 | `docs/ui_design_reference_and_wireframes_260430_1400.md` |
| UI 핸드오프 | `docs/ui_design_handoff_templates_260430_1329.md` |
| 현재 진행 단계 | `docs/current_phase.md` |
| 세션 노트 | `docs/session_notes.md` |

---

## 기술 스택

### Frontend (port 5173)
- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand (전역 상태)
- React Router v6
- WaveSurfer.js (파형 렌더링 — P1 연결 완료)

### Backend (port 8000)
- Python 3.11+ / FastAPI / Uvicorn
- ffmpeg / ffprobe (오디오 처리 기반)
- librosa (BPM/Key 추정 — P3에서 연결)
- Rubber Band CLI (key shift, 템포 유지 — P4에서 연결)
- Demucs (stem 분리 — P6에서 연결)

---

## 개발 서버 실행

```powershell
# 백엔드
.\scripts\run_backend.ps1

# 프론트엔드
.\scripts\run_frontend.ps1
```

수동 실행 (각 디렉터리에서):
```bash
# backend/
.venv/Scripts/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# frontend/
npm run dev
```

현재 상태 빠른 확인:
```powershell
.\scripts\session_context.ps1
```

---

## 디렉터리 구조

```
audio-workbench/
├─ frontend/src/
│  ├─ pages/              # 5개 페이지 (CutPage, AnalyzePage, KeyShiftPage, AmplifyPage, StemMixPage)
│  ├─ components/
│  │  ├─ layout/          # AppSidebar, PageHeader, AppLayout, ProcessingPageShell
│  │  ├─ upload/          # FileUploadCard
│  │  ├─ player/          # PrimaryPlayer
│  │  ├─ waveform/        # WaveformPanel
│  │  ├─ feedback/        # StatusBadge, InfoMessageCard
│  │  └─ result/          # FileMetaCard, ResultFileCard, DownloadButton
│  ├─ hooks/              # useAudioPlayer, useProcessingPage
│  ├─ services/api.ts     # fetch 래퍼, 공통 에러 핸들링
│  ├─ stores/fileStore.ts # Zustand 전역 파일 상태
│  └─ types/index.ts      # 공통 타입
├─ backend/app/
│  ├─ main.py             # FastAPI 앱, lifespan, CORS, 에러 핸들러
│  ├─ api/routes/         # upload, file, download, session
│  ├─ api/schemas/        # ApiResponse 스키마
│  ├─ core/               # config, temp_manager, filename_policy, errors
│  └─ services/           # 비즈니스 로직 (upload_service 등)
├─ docs/                  # PRD, DTL, 디자인 문서
└─ scripts/               # run_backend.ps1, run_frontend.ps1, session_context.ps1
```

---

## 핵심 설계 규칙

### 파일명 정책
- **모든 결과 파일명은 `backend/app/core/filename_policy.py`에서만 생성**
- 프론트는 백엔드가 내려준 `suggested_filename` 필드를 그대로 사용
- 프론트에서 파일명 문자열 조합 절대 금지

### API 응답 포맷
```json
// 성공
{ "ok": true,  "message": "...", "data": { ... }, "error": null }
// 실패
{ "ok": false, "message": "...", "data": null,  "error": { "code": "ERROR_CODE" } }
```

### 에러 코드 (backend/app/core/errors.py)
- `INVALID_FILE_TYPE` — mp3 아닌 파일
- `FILE_TOO_LARGE` — 20MB 초과
- `FILE_TOO_LONG` — 10분 초과
- `FILE_NOT_FOUND` — 파일 ID 없음
- `SESSION_NOT_FOUND` — 세션 ID 없음
- `FFPROBE_ERROR` — 오디오 처리 실패

### 페이지 상태 (모든 페이지 공통)
```
empty → uploaded → processing → success
                              → error
```
모든 페이지는 이 5단계를 명시적으로 구현한다.

### 세션/임시 파일
- 백엔드 시작 시 UUID 기반 세션 ID 자동 생성
- `backend/temp/<session_id>/{uploads,waveform,renders,stems}/` 에만 파일 생성
- 백엔드 종료(lifespan) 시 자동 삭제
- 영구 저장 / 최근 파일 목록 / 자동 복구 기능 구현 금지

---

## 공통 컴포넌트 현황

| 컴포넌트 | 경로 | 상태 |
|---|---|---|
| AppSidebar | components/layout/ | ✅ P0 완료 |
| PageHeader | components/layout/ | ✅ P0 완료 |
| AppLayout | components/layout/ | ✅ P0 완료 |
| ProcessingPageShell | components/layout/ | ✅ P1 완료 |
| FileUploadCard | components/upload/ | ✅ P0 완료 |
| FileMetaCard | components/result/ | ✅ P0 완료 |
| StatusBadge | components/feedback/ | ✅ P0 완료 |
| InfoMessageCard | components/feedback/ | ✅ P1 완료 |
| PrimaryPlayer | components/player/ | ✅ P1 완료 |
| WaveformPanel | components/waveform/ | ✅ P1 완료 |
| ResultFileCard | components/result/ | ✅ P1 완료 |
| DownloadButton | components/result/ | ✅ P1 완료 |
| WaveformCard (trim) | components/trim/ | ✅ P2 완료 |
| SelectionInfo | components/trim/ | ✅ P2 완료 |
| ControlBar (trim) | components/trim/ | ✅ P2 완료 |
| ResultCard (trim) | components/trim/ | ✅ P2 완료 |
| GuidanceCard | components/trim/ | ✅ P2 완료 |

---

## 구현 단계 현황

| 단계 | 내용 | 상태 |
|---|---|---|
| P0 | 공통 기반 구조 (백엔드 API + 프론트 스캐폴딩) | ✅ 완료 |
| P1 | 공통 오디오 UX (Player, WaveformPanel, 상태 전환 프레임) | ✅ 완료 |
| P2 | 1페이지: 음원 자르기 | ✅ 완료 |
| P3 | 2페이지: 음원 분석 | 🔲 |
| P4 | 3페이지: Key 변환 | 🔲 |
| P5 | 4페이지: 음량 증폭 | 🔲 |
| P6 | 5페이지: 스템 분리/믹스 | 🔲 |
| P7 | 안정화 / README | 🔲 |

---

## 각 페이지 착수 전 체크리스트

새 페이지 구현을 시작하기 전에 반드시 확인:

- [ ] `docs/ui_design_reference_img/` 해당 페이지 시안 확정
- [ ] 기존 공통 컴포넌트 재사용 여부 검토
- [ ] 5단계 상태 정의 (empty/uploaded/processing/success/error)
- [ ] 에러 메시지 문구 정의
- [ ] 다운로드 파일명 규칙 확인 (`filename_policy.py` 기준)
- [ ] 새로운 백엔드 서비스 파일이 필요한 경우 `backend/app/services/` 에 추가

---

## 백엔드 테스트

```bash
cd backend
.venv/Scripts/activate
python -m pytest app/tests/ -v
```

수동 테스트용 샘플 파일 3종:
- 정상 mp3 (10분 이하, 20MB 이하)
- 10분 초과 파일
- 20MB 초과 파일

---

## 외부 도구 의존성 주의

| 도구 | 필요 시점 | 설치 확인 방법 |
|---|---|---|
| ffmpeg / ffprobe | P0~ (현재) | `ffprobe -version` |
| librosa | P3 (음원 분석) | `pip show librosa` |
| Rubber Band CLI | P4 (Key 변환) | `rubberband --version` |
| Demucs | P6 (스템 분리) | `python -m demucs --help` |

각 도구는 해당 페이지 착수 전에 설치 및 PATH 등록 확인 필요.
