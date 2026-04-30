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

### 2026-04-30 — P0 공통 기반 구조 구축 완료

**완료한 것:**
- FastAPI 백엔드 초기 셋업 (main.py, CORS, lifespan 기반 세션 관리)
- 세션 단위 temp 디렉터리 관리 (`temp_manager.py`)
- 파일명 정책 모듈 (`filename_policy.py`) — sanitize, with_suffix
- 공통 에러 코드 및 응답 스키마 (`errors.py`, `schemas/response.py`)
- API 엔드포인트: upload, file/meta, file/waveform, download, session, health
- React + TypeScript + Vite + Tailwind 프론트엔드 초기 셋업
- React Router v6 — 5개 페이지 라우팅
- 공통 레이아웃: AppSidebar, PageHeader, AppLayout
- 공통 컴포넌트: FileUploadCard, FileMetaCard, StatusBadge
- Zustand 스토어 (`fileStore.ts`), API 서비스 레이어 (`api.ts`)
- 실행 스크립트: run_backend.ps1, run_frontend.ps1
- 프로젝트 개발 세팅: CLAUDE.md, .claude/settings.json, current_phase.md, session_context.ps1

**남은 것:**
- P1 공통 오디오 UX (PrimaryPlayer, WaveformPanel, useAudioPlayer 훅)
- P2~P6 각 기능 페이지

**다음 세션에서 할 것:**
- P1 착수: `PrimaryPlayer`, `WaveformPanel`, `useAudioPlayer` 구현
- `wavesurfer.js` 패키지 설치 필요 (`npm install wavesurfer.js`)
- 백엔드/프론트엔드 동시 실행 후 업로드 → 파형 렌더링 흐름 검증

**주의사항:**
- ffprobe가 PATH에 등록되어 있어야 waveform API 정상 동작
- `backend/temp/` 는 .gitignore 대상 (세션 파일이므로 커밋 금지)
- filename_policy.py 수정 시 모든 서비스 파일명 생성 로직에 영향

---
