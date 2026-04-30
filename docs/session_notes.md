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
