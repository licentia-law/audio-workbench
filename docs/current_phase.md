# 현재 진행 단계

- 최종 업데이트: 2026-05-01 (P5 음량 증폭 완료 → P4 Key 변환 다음 착수)

---

## 전체 진행 현황

> **실제 구현 순서:** P2 → P3 → P5 → P4 → P6
> (단순·독립적인 것부터, 외부 도구 의존도 낮은 것부터)

| 단계 | 내용 | 상태 |
|---|---|---|
| P0 | 공통 기반 구조 | ✅ 완료 |
| P1 | 공통 오디오 UX | ✅ 완료 |
| P2 | 1페이지: 음원 자르기 | ✅ 완료 |
| P3 | 2페이지: 음원 분석 | ✅ 완료 |
| P5 | 4페이지: 음량 증폭 | ✅ 완료 |
| **P4** | **3페이지: Key 변환** | **🔲 다음 착수** |
| P6 | 5페이지: 스템 분리/믹스 | 🔲 대기 |
| P7 | 안정화 / README | 🔲 대기 |

---

## P0 완료 내역 (2026-04-30)

신규 생성 파일 44개. 리뷰 후 수정 5건 반영 완료.

### Backend
- [x] `app/main.py` — FastAPI 앱, CORS, lifespan(세션 초기화/정리), AppError 핸들러
- [x] `app/core/config.py` — 앱 설정값 SSOT (max_file_size_bytes, max_duration_seconds 등)
- [x] `app/core/temp_manager.py` — 세션 UUID 발급, temp/{uploads,waveform,renders,stems}/ 생성/삭제
- [x] `app/core/filename_policy.py` — sanitize_base_name, with_suffix
- [x] `app/core/errors.py` — AppError 클래스, 에러 코드 상수 5종
- [x] `app/api/schemas/response.py` — ApiResponse[T] 제네릭 (성공/실패 응답 SSOT)
- [x] `POST /api/upload` — mp3 업로드 + 유효성 검사 (설정값 참조)
- [x] `GET /api/file/{id}/meta`, `GET /api/file/{id}/waveform`
- [x] `GET /api/download/{artifact_id}`, `DELETE /api/session/{session_id}`
- [x] `app/services/upload_service.py` — 1회 저장 후 검증, 실패 시 unlink
- [x] Python 3.12 가상환경 `.venv` + 패키지 설치 완료 (fastapi 0.136, uvicorn 0.46, pydantic 2.13)

### 리뷰 수정 사항 (5건)
- [x] 에러 응답 포맷 `ApiResponse.failure()` 단일 경로 통일, `error_response()` 중복 삭제
- [x] `upload.py` 파일 크기 하드코딩 → `settings.max_file_size_bytes` 참조
- [x] `fileStore` 미사용 `status` / `setStatus` 제거
- [x] `upload_service` 이중 저장 → 1회 저장 후 검증, `_probe_duration_bytes` 삭제
- [x] `errors.py`, `response.py` 미사용 import 제거

### Frontend
- [x] React 18 + TypeScript + Vite 5 + Tailwind 3 초기 셋업
- [x] `vite.config.ts` — dev port 5173, `/api` → `:8000` 프록시
- [x] React Router v6 라우팅 (5개 페이지)
- [x] `AppSidebar` (5개 NavLink + active 스타일), `PageHeader`, `AppLayout`
- [x] `FileUploadCard` — 드래그&드롭, 확장자·크기·길이 1차 검증, API 호출
- [x] `FileMetaCard`, `StatusBadge`
- [x] `api.ts` (fetch 래퍼), `fileStore.ts` (Zustand), `types/index.ts`
- [x] 5개 placeholder 페이지 (CutPage, AnalyzePage, KeyShiftPage, AmplifyPage, StemMixPage)
- [x] Node 24 / npm 11 — npm install 완료 (254 packages)

### Scripts
- [x] `scripts/run_backend.ps1`
- [x] `scripts/run_frontend.ps1`

---

## P1 완료 내역 (2026-04-30)

### 신규 생성 파일

#### Frontend
- [x] `frontend/src/hooks/useAudioPlayer.ts` — WaveSurfer 인스턴스 생성·소멸 관리, `play()` / `pause()` / `togglePlay()` / `seek(sec)` / `isPlaying` / `currentTime` / `duration` / `isReady` 노출
- [x] `frontend/src/hooks/useProcessingPage.ts` — 5개 페이지 공통 상태·핸들러 훅 (`pageStatus`, `peaks`, `errorMsg`, `audioSrc`, `onUploadSuccess`, `onUploadError`, `onProcess`, `onReset`). processHandler만 페이지별로 주입
- [x] `frontend/src/components/player/PrimaryPlayer.tsx` — 파형 렌더링 div + 재생/정지 버튼 + MM:SS 타이머 통합. `src?` / `peaks?` / `disabled?` props
- [x] `frontend/src/components/waveform/WaveformPanel.tsx` — 스타일 컨테이너 (isEmpty 시 skeleton). `height?` / `color?` / `isEmpty?` props
- [x] `frontend/src/components/result/ResultFileCard.tsx` — 결과 파일명 + DownloadButton 카드. `filename` / `downloadUrl` / `label?` props
- [x] `frontend/src/components/result/DownloadButton.tsx` — anchor 기반 직접 다운로드. `url` / `filename` / `disabled?` / `label?` props
- [x] `frontend/src/components/feedback/InfoMessageCard.tsx` — info / warning / error 3종 인라인 메시지 카드
- [x] `frontend/src/components/layout/ProcessingPageShell.tsx` — 5개 페이지 공통 UI 프레임 (FileUploadCard + FileMetaCard + PrimaryPlayer + 스피너 + 결과 + 에러 + 버튼 영역)

#### Backend
- [x] `GET /api/file/{id}/audio` — 업로드 파일 스트리밍 엔드포인트 (PrimaryPlayer 재생용)

### 수정된 파일

#### Frontend
- [x] `FileUploadCard` — `onSuccess(meta)` / `onError(msg)` 콜백 props 추가
- [x] 5개 페이지 (`CutPage` · `AnalyzePage` · `KeyShiftPage` · `AmplifyPage` · `StemMixPage`) — `useProcessingPage + ProcessingPageShell` 기반으로 교체. 페이지당 ~15줄 (기존 ~120줄 5중 복제 → 공통화)

#### Backend
- [x] `upload_service.py` — `get_audio_path(file_id) → Optional[Path]` 추가 (내부 dict 직접 접근 대신 명시적 API)
- [x] `file.py` — `stream_audio`에서 `get_audio_path()` 사용, 불필요한 내부 접근 제거

### 리뷰 수정 사항 (6건)
- [x] `useProcessingPage` + `ProcessingPageShell`로 페이지 5중 코드 중복 제거 (SSOT 복원)
- [x] `useAudioPlayer` — `play()` / `pause()` 메서드 명시 노출 (요구사항 충족)
- [x] `upload_service.get_audio_path()` 추가, `get_meta_internal()` 제거 (백엔드 캡슐화)
- [x] `CutPage` success 상태 — `ResultFileCard(원본 파일)` → `InfoMessageCard` placeholder로 교체 (filename_policy 위반 제거)
- [x] `WaveformPanel` — `forwardRef + useImperativeHandle + getter` 3단 인디렉션 제거, 순수 스타일 컨테이너로 단순화
- [x] `PrimaryPlayer` — proxy ref 패턴 제거, `useRef<HTMLDivElement>` 직접 소유로 평탄화

---

## P2 완료 내역 (2026-04-30)

### Backend

- [x] `app/core/errors.py` — `INVALID_CUT_RANGE` 에러 코드 추가
- [x] `app/core/filename_policy.py` — `cut_filename(original_name)` 추가 (`_cut` suffix 규칙)
- [x] `app/core/artifact_registry.py` (신규) — artifact_id → suggested_filename 인메모리 레지스트리
- [x] `app/services/cut_service.py` (신규) — ffmpeg 기반 mp3 자르기, `asyncio.to_thread` (Windows 호환)
- [x] `app/api/routes/cut.py` (신규) — `POST /api/cut` (file_id, start_sec, end_sec 검증 + cut 실행)
- [x] `app/api/routes/download.py` — artifact_registry에서 suggested_filename 조회 후 헤더 설정
- [x] `app/main.py` — cut 라우터 등록
- [x] `app/services/upload_service.py` — `asyncio.create_subprocess_exec` → `asyncio.to_thread(subprocess.run)` 전환 (Windows NotImplementedError 해결)

### Frontend

- [x] `tailwind.config.js` — 디자인 토큰 확장: ink(850/800/700/600/500), line, fg, brand(cyan/cyanDeep/indigo), play, ok, warn, err, JetBrains Mono, shadow-card
- [x] `src/index.css` — body 배경 `#0B1020` raw CSS (extend 토큰 @apply 불가 우회)
- [x] `src/types/index.ts` — `TrimSelection`, `CutResult` 타입 추가
- [x] `src/services/api.ts` — `apiService.cut()` 추가
- [x] `src/hooks/useTrimSelection.ts` (신규) — start/end 상태 + clamp + isValid 검증
- [x] `src/hooks/useTrimPlayback.ts` (신규) — HTMLAudioElement 기반 구간 재생 (playFrom/stop/seek)
- [x] `src/components/trim/WaveformCard.tsx` (신규) — SVG 기반 파형 (dim+hot clipPath), 핸들 드래그, 플레이헤드, 눈금
- [x] `src/components/trim/SelectionInfo.tsx` (신규) — 시작/종료/길이 3열 표시
- [x] `src/components/trim/ControlBar.tsx` (신규) — 재생·정지·구간미리듣기·자르기 버튼
- [x] `src/components/trim/ResultCard.tsx` (신규) — 결과 파일 미니 플레이어 + 다운로드
- [x] `src/components/trim/GuidanceCard.tsx` (신규) — 실시간 유효성 체크리스트
- [x] `src/pages/CutPage/index.tsx` — 전면 재작성: useTrimSelection + useTrimPlayback + 5단계 상태 전환
- [x] `src/components/layout/AppSidebar.tsx` — 디자인 토큰 ink/line/brand-cyan으로 갱신
- [x] `src/components/layout/AppLayout.tsx` — main 영역 `bg-ink-850` 적용
- [x] `docs/manual/runtime.md` (신규) — 가상환경 없는 실행 명령어 문서화

### 핵심 기술 결정

- **Windows asyncio 이슈**: uvicorn `--reload` 모드에서 `asyncio.create_subprocess_exec`이 `NotImplementedError` 발생 → `asyncio.to_thread(subprocess.run, ...)` 패턴으로 전 서비스 통일
- **Tailwind extend 토큰 @apply 불가**: `extend.colors`로 정의한 커스텀 색상은 `@apply`에서 인식 안 됨 → raw hex CSS 사용
- **SVG 파형**: WaveSurfer.js 대신 SVG `<rect>` + `<clipPath>` 조합으로 dim/hot 파형 직접 구현

---

---

## P3 완료 내역 (2026-05-01)

### Backend

- [x] `app/core/errors.py` — `ANALYSIS_FAILED` 에러 코드 추가
- [x] `app/services/analysis_service.py` (신규) — librosa 기반 5단계 분석
  - Key 추정: Krumhansl-Schmuckler 프로파일 + `chroma_cqt`, confidence < 0.4 → unknown
  - BPM 추정: `librosa.beat.beat_track`, onset strength confidence, `np.asarray(tempo).item()` (NumPy 1.25+ 호환)
  - 음량 측정: Peak / RMS dBFS
  - 모든 CPU-blocking 호출 → `asyncio.to_thread` (Windows asyncio 정책)
- [x] `app/api/routes/analyze.py` (신규) — `POST /api/analyze` (file_id → AnalysisResult)
- [x] `app/main.py` — analyze 라우터 등록

### Frontend

- [x] `src/types/index.ts` — `StepStatus`, `StepKey`, `AnalysisStep`, `KeyResult`, `BpmResult`, `LoudnessResult`, `AnalysisResult` 타입 추가
- [x] `src/services/api.ts` — `apiService.analyze(fileId)` 추가
- [x] `src/hooks/useAnalysisJob.ts` (신규)
  - STEP_DEFS 5종 (decode 10% / peaks 20% / key 40% / bpm 25% / loudness 5%) — SSOT
  - setInterval 시뮬레이션 0→0.95 (5초 기준), API 완료 시 전 단계 done
  - `overallProgress` 훅 내부에서 계산·반환 (페이지 중복 weights 불필요)
- [x] `src/hooks/useAudioPlayback.ts` (신규) — `useTrimPlayback` 이름 변경 (기능 동일)
- [x] `src/hooks/useTrimPlayback.ts` — `useAudioPlayback` re-export로 교체 (하위 호환)
- [x] `src/utils/format.ts` (신규) — `formatBytes`, `formatDuration`, `formatSampleRate`, `formatBitrate` SSOT
- [x] `src/components/upload/UploadCard.tsx` (신규) — P2+ 공용 업로드 카드 (`inputId` prop)
- [x] `src/components/icons/Icon.tsx` — `metronome`, `gauge`, `list` 아이콘 추가; `IconName` 타입 export
- [x] `src/components/analyze/RunBar.tsx` (신규) — 재생/정지 + 분석 실행 버튼 바
- [x] `src/components/analyze/ResultBigCard.tsx` (신규) — Key/BPM 대형 결과 카드 (success/processing/error/idle 상태)
- [x] `src/components/analyze/NoticeCard.tsx` (신규) — 분석 안내 카드 (SVG wave 모티프)
- [x] `src/components/analyze/LoudnessCard.tsx` (신규) — Peak/RMS dBFS 미터 (green→amber→red 그라데이션)
- [x] `src/components/analyze/StepListCard.tsx` (신규) — 5단계 진행 목록 (아이콘+라벨+프로그레스바+%)
- [x] `src/components/analyze/FootNotice.tsx` (신규) — warn/err/ok 3종 하단 안내 배너 (IconName 타입 활용)
- [x] `src/pages/AnalyzePage/index.tsx` — 전면 재작성 (UploadCard + RunBar + 3열 + 2열 레이아웃)
- [x] `src/pages/CutPage/index.tsx` — UploadCard + useAudioPlayback으로 교체 (인라인 UploadSection 제거)
- [x] `src/components/result/FileMetaCard.tsx` — `utils/format` import로 교체

### 핵심 기술 결정

- **librosa Windows**: CPU-blocking → 모든 librosa/numpy 호출 `asyncio.to_thread` 필수
- **NumPy 1.25+ 호환**: `librosa.beat.beat_track` 반환값 → `float(np.asarray(tempo).item())`
- **양쪽 unknown → error**: Key+BPM 모두 unknown이면 `pageStatus='error'`, 하나만이면 success+warn
- **진행 시뮬레이션**: API 실행 중 setInterval로 0→0.95 시각적 진행, 완료 시 전 단계 100%
- **SSOT 확립**: STEP weights는 `useAnalysisJob` 단 한 곳, 포맷 헬퍼는 `utils/format.ts` 단 한 곳

### 리뷰 후 수정 내역 (A1~C3)
- [x] A1: `useAnalysisJob`에서 `overallProgress` 계산·반환, AnalyzePage 중복 weights 제거
- [x] A2: `utils/format.ts` 신규, CutPage/AnalyzePage/FileMetaCard 3중 중복 제거
- [x] A3: BPM tempo `np.asarray(tempo).item()` 타입 안전 수정 + numpy import 위치 교정
- [x] B1: `UploadCard` 공통 컴포넌트 추출, 두 페이지 인라인 코드 제거
- [x] B2: `useAudioPlayback` 이름 변경, `useTrimPlayback` re-export 유지
- [x] C1: `analyze.py` `except Exception as e` → `except Exception` (미사용 변수)
- [x] C2: `handleClear` `useCallback([playback, ...])` → 일반 함수 (불안정 dep 해소)
- [x] C3: `IconName` export, `FootNotice` 로컬 타입 제거

---

---

## P5 완료 내역 (2026-05-01)

### Backend

- [x] `app/core/errors.py` — `AMPLIFY_FAILED` 에러 코드 추가
- [x] `app/core/filename_policy.py` — `amp_filename(original_name, gain_db)` 추가 (`song(+6dB).mp3` 형식)
- [x] `app/services/amplify_service.py` (신규) — ffmpeg volume filter + alimiter, volumedetect 출력 측정
  - anti_clip=True → `alimiter=limit=0.95:attack=5:release=50` 체인 추가
  - `asyncio.to_thread(subprocess.run)` 패턴 (Windows asyncio 정책)
  - volumedetect: stderr 파싱으로 mean_volume(RMS) / max_volume(Peak) 추출
- [x] `app/api/routes/amplify.py` (신규) — `POST /api/amplify` (file_id, gain_db -20~+20, anti_clip)
- [x] `app/main.py` — amplify 라우터 등록

### Frontend

- [x] `src/types/index.ts` — `AmpStats`, `AmpResult` 타입 추가
- [x] `src/services/api.ts` — `apiService.amplify(fileId, gainDb, antiClip)` 추가 (snake_case → camelCase 변환)
- [x] `src/lib/audio/dbfs.ts` (신규) — `linToDb`, `dbToLin`, `computeStats`, `dbToPct` 헬퍼
- [x] `src/lib/audio/amplify.ts` (신규) — `createPreviewChain` (GainNode + AnalyserNode)
- [x] `src/hooks/useGainPreview.ts` (신규) — Web Audio GainNode 실시간 미리듣기, 레벨 미터 AnimationFrame
- [x] `src/components/icons/Icon.tsx` — `sparkle`, `shield`, `meter`, `wave` 아이콘 추가
- [x] `src/components/amplify/GainSliderPanel.tsx` (신규) — 게인 슬라이더 (-20~+20 dB), 존 컬러링, Anti-Clip 토글
- [x] `src/components/amplify/LevelMeterPanel.tsx` (신규) — 32-세그먼트 LED 레벨 미터 (cyan/amber/red 구간)
- [x] `src/components/amplify/AmpWaveformCard.tsx` (신규) — dim(원본)+hot(증폭) 듀얼 레이어 SVG 파형
- [x] `src/components/amplify/AmpControlBar.tsx` (신규) — 미리듣기/음량변환/초기화 3버튼 바
- [x] `src/components/amplify/AmpResultCard.tsx` (신규) — 처리 중/성공/오류 3가지 상태 결과 카드
- [x] `src/components/amplify/AmpGuidanceCard.tsx` (신규) — 게인/클리핑/anti-clip 상태 기반 동적 안내
- [x] `src/pages/AmplifyPage/index.tsx` — 전면 재작성

### 핵심 기술 결정

- **Web Audio 미리듣기**: fetch `/api/file/{id}/audio` → Blob → AudioContext.decodeAudioData → GainNode 실시간 조정
- **레벨 미터**: AnalyserNode `getFloatTimeDomainData` + requestAnimationFrame으로 실시간 peak 계산
- **파형**: `/api/file/{id}/waveform` peaks 데이터 → dim(scale=1) + hot(scale=ampScale) 듀얼 SVG path
- **클리핑 감지**: `ampScale * 0.95 > 1.0` 시 파형 hot 레이어 red, 경고 표시
- **alimiter**: ffmpeg alimiter로 피크 제한 (anti_clip=True일 때)
- **결과 stats**: ffmpeg volumedetect stderr 파싱으로 RMS/Peak 측정

---

## 다음 단계: P4 — Key 변환

### P4 착수 전 체크
- [ ] `docs/ui_design_reference/claude_design/` P4 시안 확정
- [ ] Rubber Band CLI 설치 확인 (`rubberband --version`)
- [ ] `errors.py`에 `KEY_SHIFT_FAILED` 에러 코드 추가
- [ ] `filename_policy.py`에 key shift 결과 파일명 규칙 추가
- [ ] `key_shift_service.py` 서비스 파일 생성
- [ ] `POST /api/key-shift` 라우터 추가
- [ ] `KeyShiftPage` UI 설계 (semitone 선택 UI 확정)
