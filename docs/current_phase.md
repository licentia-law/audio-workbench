# 현재 진행 단계

- 최종 업데이트: 2026-04-30 (P2 완료 확정)

---

## 전체 진행 현황

| 단계 | 내용 | 상태 |
|---|---|---|
| P0 | 공통 기반 구조 | ✅ 완료 |
| P1 | 공통 오디오 UX | ✅ 완료 |
| P2 | 1페이지: 음원 자르기 | ✅ 완료 |
| P3 | 2페이지: 음원 분석 | 🔲 대기 |
| P4 | 3페이지: Key 변환 | 🔲 대기 |
| P5 | 4페이지: 음량 증폭 | 🔲 대기 |
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

## 다음 단계: P3 — 음원 분석

### P3 착수 전 체크
- [ ] `docs/ui_design_reference/` 해당 페이지 시안 확정
- [ ] BPM / Key 분석 파라미터 확정
- [ ] `librosa` 설치 확인 (`pip show librosa`)
- [ ] `analyze_service.py` 서비스 파일 생성
- [ ] `POST /api/analyze` 라우터 추가
- [ ] `AnalyzePage` UI 설계 (결과 표시 방식 확정)
