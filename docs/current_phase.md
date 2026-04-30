# 현재 진행 단계

- 최종 업데이트: 2026-04-30

---

## 전체 진행 현황

| 단계 | 내용 | 상태 |
|---|---|---|
| P0 | 공통 기반 구조 | ✅ 완료 |
| P1 | 공통 오디오 UX | 🔲 대기 |
| P2 | 1페이지: 음원 자르기 | 🔲 대기 |
| P3 | 2페이지: 음원 분석 | 🔲 대기 |
| P4 | 3페이지: Key 변환 | 🔲 대기 |
| P5 | 4페이지: 음량 증폭 | 🔲 대기 |
| P6 | 5페이지: 스템 분리/믹스 | 🔲 대기 |
| P7 | 안정화 / README | 🔲 대기 |

---

## P0 완료 내역 (2026-04-30)

### Backend
- [x] FastAPI 앱 초기 셋업 (`main.py`, CORS, lifespan)
- [x] 세션 단위 temp 디렉터리 관리 (`temp_manager.py`)
- [x] 파일명 정책 모듈 (`filename_policy.py`)
- [x] 공통 에러 응답 스키마 (`errors.py`, `schemas/response.py`)
- [x] `POST /api/upload` — mp3 업로드 + 유효성 검사
- [x] `GET /api/file/{file_id}/meta` — 파일 메타데이터 조회
- [x] `GET /api/file/{file_id}/waveform` — 파형 데이터 반환
- [x] `GET /api/download/{artifact_id}` — 결과 파일 다운로드
- [x] `DELETE /api/session/{session_id}` — 세션 정리
- [x] `GET /api/health` — 헬스 체크

### Frontend
- [x] React + TypeScript + Vite + Tailwind 초기 셋업
- [x] React Router v6 라우팅 (5개 페이지)
- [x] `AppSidebar`, `PageHeader`, `AppLayout` 레이아웃 컴포넌트
- [x] `FileUploadCard` 컴포넌트
- [x] `FileMetaCard` 컴포넌트
- [x] `StatusBadge` 컴포넌트
- [x] `api.ts` — fetch 래퍼, 공통 에러 핸들링
- [x] `fileStore.ts` — Zustand 전역 파일 상태
- [x] `types/index.ts` — 공통 타입 정의

### Scripts
- [x] `scripts/run_backend.ps1`
- [x] `scripts/run_frontend.ps1`

---

## 다음 단계: P1 — 공통 오디오 UX

### P1 구현 목표
모든 페이지가 공유할 재생/상태/파형 UX를 구축한다.

### P1 작업 목록
- [ ] `PrimaryPlayer` 컴포넌트 — 재생/정지, 현재 위치 표시
- [ ] 재생 상태 관리 훅 (`useAudioPlayer`) — 재생/정지/현재 위치
- [ ] `WaveformPanel` 컴포넌트 — WaveSurfer.js 연결
- [ ] `ResultFileCard` 컴포넌트 — 결과 파일 정보 + 다운로드 버튼
- [ ] `DownloadButton` 컴포넌트
- [ ] 페이지별 empty/uploaded/processing/success/error 상태 전환 프레임

### P1 DoD
- [ ] 업로드된 mp3를 PrimaryPlayer로 재생/정지할 수 있다
- [ ] 파형 데이터가 WaveformPanel에 렌더링된다
- [ ] 상태별 레이아웃 전환이 가능하다
- [ ] 공통 버튼/카드 스타일이 통일된다

### P1 착수 전 확인
- ffprobe PATH 등록 여부 확인 (`ffprobe -version`)
- WaveSurfer.js npm 패키지 설치 (`npm install wavesurfer.js`)

---

## P1 완료 후 → P2 착수 전 체크

- [ ] `docs/ui_design_reference_img/Page1.png` 시안 확정
- [ ] `CutPage` 상태 정의 작성
- [ ] `cut_service.py` 서비스 파일 생성
- [ ] `POST /api/cut` 라우터 추가
