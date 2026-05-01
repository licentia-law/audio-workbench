# 세션 노트

새 Claude Code 세션 시작 시 이 파일을 먼저 확인한다.
작업 완료 후에는 이 파일에 결과와 다음 세션 인수인계 내용을 기록한다.

---

## 인수인계 템플릿

새 세션에서 작업 완료 후 아래 양식으로 기록:

```
### YYYY-MM-DD — [작업 내용 한 줄 요약]
**완료한 것:** ...
**남은 것:** ...
**다음 세션에서 할 것:** ...
**주의사항:** ...
```

---

## 세션 기록

### 2026-04-30 — P0 공통 기반 구조 구축 완료 (DoD 전항목 통과)

**완료한 것:**
- 신규 파일 44개 생성, 리뷰 후 수정 5건 반영
- 백엔드: FastAPI 앱, CORS, lifespan 세션 관리, temp_manager, filename_policy, errors, ApiResponse[T]
- API: POST /upload, GET /file/{id}/meta·waveform, GET /download/{id}, DELETE /session/{id}, GET /health
- upload_service: 1회 저장 후 ffprobe 검증, 실패 시 unlink (이중 저장 제거)
- 프론트: React 18 + Vite 5 + Tailwind 3 + Zustand + Router v6
- 공통 컴포넌트: AppSidebar(NavLink+active), FileUploadCard(드래그&드롭+1차 검증), FileMetaCard, StatusBadge
- vite.config.ts: /api → :8000 프록시
- Python 3.12 .venv + 패키지 설치 완료 / Node 24 npm install 254 packages 완료
- 프로젝트 개발 세팅: CLAUDE.md, .claude/settings.json, current_phase.md, session_notes.md, session_context.ps1

**DoD 전항목 통과:**
- 프론트/백엔드 로컬 동시 실행 ✅
- mp3 업로드 후 메타정보 조회 ✅
- 잘못된 형식/크기/길이 오류 메시지 ✅
- temp 폴더 생성/삭제 흐름 ✅
- 좌측 사이드바 + 5개 페이지 라우팅 ✅
- 공통 컴포넌트 렌더링 ✅

**다음 세션에서 할 것:**
- P1 착수: `PrimaryPlayer`, `WaveformPanel(WaveSurfer.js)`, `useAudioPlayer` 훅 구현
- `ResultFileCard`, `DownloadButton` 구현
- 페이지별 empty/uploaded/processing/success/error 상태 전환 프레임 구현
- `npm install wavesurfer.js` 필요

**주의사항:**
- ffprobe PATH 등록 필수 (`ffprobe -version` 으로 확인)
- `backend/temp/` .gitignore 대상 (커밋 금지)
- `filename_policy.py` 수정 시 전 서비스 파일명에 영향
- `fileStore`에서 `status`/`setStatus` 제거됨 — 페이지별 로컬 상태로 관리

---

### 2026-04-30 — P1 공통 오디오 UX 구현 완료 + 리뷰 수정 6건 반영

**완료한 것:**

신규 파일 8개 생성, 기존 파일 8개 수정.

- `useAudioPlayer` 훅 — WaveSurfer 생명주기 관리, play/pause/togglePlay/seek/isPlaying/currentTime/duration/isReady 노출
- `useProcessingPage` 훅 — 5개 페이지 공통 상태·핸들러 집중 관리 (processHandler만 외부 주입)
- `PrimaryPlayer` — 파형 div 직접 소유 + 재생/정지 버튼 + MM:SS 타이머
- `WaveformPanel` — 순수 스타일 컨테이너/skeleton (forwardRef 제거, 복잡도 최소화)
- `ResultFileCard` / `DownloadButton` / `InfoMessageCard` — 결과·다운로드·메시지 공통 컴포넌트
- `ProcessingPageShell` — 페이지 공통 UI 프레임 (업로드→파형→처리→결과 전 구간)
- `GET /api/file/{id}/audio` 엔드포인트 추가 (PrimaryPlayer 재생 소스)
- `FileUploadCard` — `onSuccess` / `onError` 콜백 추가
- 5개 페이지 → `useProcessingPage + ProcessingPageShell` 기반으로 교체 (페이지당 ~15줄)

**리뷰 수정 6건:**
- 페이지 5중 코드 중복 → `useProcessingPage + ProcessingPageShell`으로 SSOT 복원
- `useAudioPlayer` play/pause 명시 노출 (요구사항 충족)
- `upload_service.get_audio_path()` 추가, `get_meta_internal()` 제거 (캡슐화)
- CutPage success 상태 placeholder → `InfoMessageCard`로 교체 (filename_policy 위반 제거)
- `WaveformPanel` forwardRef 3단 인디렉션 제거
- `PrimaryPlayer` proxy ref 제거, div 직접 소유로 평탄화

**남은 것 / 다음 세션에서 할 것:**
- P2: 음원 자르기 구현
  - `cut_service.py` + `POST /api/cut` 라우터
  - `CutPage` — 시작/종료 시간 입력 UI + 실제 ffmpeg 처리 연결
  - `filename_policy.py`에 cut 결과 파일명 규칙 추가
  - `ResultFileCard` 실제 연결 (백엔드 `suggested_filename` 기반)

**주의사항:**
- P2~P6 각 페이지는 `useProcessingPage`의 `processHandler`에 실제 API 호출 로직만 주입하면 됨
- `ProcessingPageShell`은 공통 프레임이므로 페이지별 커스텀 UI(시간 입력 슬라이더 등)는 Shell 외부에 배치하거나 `successContent`에 전달
- `ResultFileCard`는 백엔드 응답의 `suggested_filename`을 사용해야 함 (프론트 파일명 조합 금지)
- wavesurfer.js `ws.load(src, [peaks])` — peaks는 `number[][]` (채널 배열 배열) 형식

---

### 2026-05-01 — P3 음원 분석 구현 완료 + 리뷰 수정 전항목 반영

**완료한 것:**

Backend (신규/수정 4개 파일):
- `analysis_service.py` (신규) — librosa 기반 Key/BPM/Loudness 3종 분석, 모든 호출 `asyncio.to_thread`
  - Key: Krumhansl-Schmuckler 12키 프로파일 매칭, confidence < 0.4 → unknown
  - BPM: `beat_track` + onset strength confidence, `np.asarray(tempo).item()` (NumPy 1.25+ 안전)
  - 음량: Peak dBFS / RMS avg dBFS
- `api/routes/analyze.py` (신규) — `POST /api/analyze`
- `errors.py` — `ANALYSIS_FAILED` 추가
- `main.py` — analyze 라우터 등록

Frontend (신규 11개, 수정 6개 파일):
- `hooks/useAnalysisJob.ts` (신규) — STEP_DEFS SSOT, setInterval 진행 시뮬레이션, `overallProgress` 반환
- `hooks/useAudioPlayback.ts` (신규) — `useTrimPlayback` 이름 변경 (기능 동일)
- `hooks/useTrimPlayback.ts` — re-export 파일로 교체 (하위 호환)
- `utils/format.ts` (신규) — formatBytes/Duration/SampleRate/Bitrate SSOT
- `components/upload/UploadCard.tsx` (신규) — P2+ 공용 업로드 카드 (`inputId` prop)
- `components/icons/Icon.tsx` — metronome/gauge/list 아이콘 추가, `IconName` export
- `components/analyze/` 6종 (신규): RunBar, ResultBigCard, NoticeCard, LoudnessCard, StepListCard, FootNotice
- `pages/AnalyzePage/index.tsx` — 전면 재작성
- `pages/CutPage/index.tsx` — UploadCard + useAudioPlayback 적용
- `types/index.ts` — 분석 관련 타입 6종 추가
- `services/api.ts` — `analyze()` 추가

리뷰 수정 7건 (A1~C3) 전항목 반영 완료.

**핵심 트러블슈팅:**
- librosa BPM: `librosa.beat.beat_track` 반환 `numpy.ndarray(1,)` → `float()` 직접 호출 시 NumPy 1.25+ deprecation
  → `float(np.asarray(tempo).item())`으로 해결
- numpy import가 사용 지점보다 아래에 있었음 → 함수 상단으로 이동
- Tailwind `line2` 토큰: 이전 세션에서 `line: { 2: '...' }` → `border-line-2` (하이픈) 생성 버그
  → `line2: '#2A3358'` 플랫 키로 수정 완료 (P2~P3 경계)

**남은 것 / 다음 세션에서 할 것:**
- P4: Key 변환 (Rubber Band CLI)
  - `rubberband --version` 설치 확인 필수
  - `key_shift_service.py` + `POST /api/key-shift`
  - semitone 선택 UI (±12 범위)
  - `KeyShiftPage` 구현

**주의사항 (P4 착수 시):**
- Rubber Band CLI는 ffmpeg과 달리 Windows 별도 바이너리 다운로드 필요 (Breakfastquay rubberband-win)
- P3에서 완성된 `UploadCard` 공통 컴포넌트 그대로 재사용 (`inputId="keyshift-file-input"`)
- P3에서 완성된 `useAudioPlayback` 훅 그대로 재사용
- `asyncio.to_thread(subprocess.run, ...)` 패턴 유지 (Windows asyncio 정책)
- Key shift 결과 파일명은 `filename_policy.py`에서만 생성 (프론트 하드코딩 금지)
- 새 에러 코드는 반드시 `errors.py`에 상수로 추가 후 import

---

### 2026-04-30 — P2 음원 자르기 구현 완료

**완료한 것:**

Backend (신규/수정 8개 파일):
- `cut_service.py` — ffmpeg 기반 구간 자르기 (`asyncio.to_thread` 패턴)
- `artifact_registry.py` — artifact_id → suggested_filename 인메모리 매핑
- `POST /api/cut` 라우터 (범위 검증 + INVALID_CUT_RANGE 에러)
- `filename_policy.py` — `cut_filename()` 추가
- `errors.py` — `INVALID_CUT_RANGE` 추가
- `download.py` — artifact_registry 기반 파일명 헤더
- `upload_service.py` — Windows asyncio 이슈 완전 해결 (`to_thread`)

Frontend (신규/수정 13개 파일):
- `tailwind.config.js` — 디자인 토큰 전면 확장 (ink/line/fg/brand/play/ok/warn/err)
- `useTrimSelection`, `useTrimPlayback` 훅
- `components/trim/` 5개 컴포넌트 (WaveformCard, SelectionInfo, ControlBar, ResultCard, GuidanceCard)
- `CutPage/index.tsx` 전면 재작성
- `AppSidebar`, `AppLayout` 디자인 토큰 갱신
- `docs/manual/runtime.md` 신규 작성

**핵심 트러블슈팅:**
- Windows에서 uvicorn `--reload` + `asyncio.create_subprocess_exec` → `NotImplementedError` 발생
  → `asyncio.to_thread(subprocess.run, ...)` 패턴으로 해결 (upload_service + cut_service 모두 적용)
- Tailwind `extend.colors` 토큰은 `@apply`에서 동작 안 함 → raw hex CSS 사용
- `.venv/Scripts/Activate.ps1` 없음 → 실행 파일 직접 경로 지정 방식 문서화

**남은 것 / 다음 세션에서 할 것:**
- P3: 음원 분석 (BPM + Key)
  - `librosa` 설치 확인 필요
  - `analyze_service.py` + `POST /api/analyze`
  - `AnalyzePage` UI 구현

**주의사항:**
- `asyncio.to_thread(subprocess.run, ...)` 패턴 — 새로운 ffmpeg/ffprobe 호출 시 반드시 이 패턴 사용
- Tailwind 커스텀 토큰은 JSX className에서만 사용, CSS `@apply`에서는 raw hex 사용
- `artifact_registry`는 인메모리 → 백엔드 재시작 시 초기화됨 (세션 정책상 의도된 동작)

---
