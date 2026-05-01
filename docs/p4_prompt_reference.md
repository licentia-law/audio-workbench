# P4 프롬프트 작성 참고 — P3 작업 내역 요약

메인 대화창에서 P4 프롬프트 작성 시 이 문서를 참고한다.
이 문서는 P3 구현 결과를 정리한 인수인계 자료다.

---

## P3에서 완성된 파일 목록

### 신규 생성

| 파일 경로 | 역할 |
|---|---|
| `backend/app/services/analysis_service.py` | librosa 기반 Key/BPM/Loudness 분석 |
| `backend/app/api/routes/analyze.py` | `POST /api/analyze` 라우터 |
| `frontend/src/hooks/useAnalysisJob.ts` | 5단계 분석 진행 시뮬레이션 + API 호출 훅 |
| `frontend/src/hooks/useAudioPlayback.ts` | HTMLAudioElement 재생 훅 (구 useTrimPlayback 이름 변경) |
| `frontend/src/utils/format.ts` | formatBytes / formatDuration / formatSampleRate / formatBitrate SSOT |
| `frontend/src/components/upload/UploadCard.tsx` | P2+ 공용 업로드 카드 (`inputId` prop으로 페이지 구분) |
| `frontend/src/components/analyze/RunBar.tsx` | 재생/정지 + 분석 실행 버튼 바 |
| `frontend/src/components/analyze/ResultBigCard.tsx` | Key/BPM 대형 결과 카드 |
| `frontend/src/components/analyze/NoticeCard.tsx` | 분석 안내 카드 |
| `frontend/src/components/analyze/LoudnessCard.tsx` | Peak/RMS dBFS 미터 |
| `frontend/src/components/analyze/StepListCard.tsx` | 5단계 진행 목록 |
| `frontend/src/components/analyze/FootNotice.tsx` | warn/err/ok 하단 안내 배너 |

### 주요 수정

| 파일 경로 | 변경 내용 |
|---|---|
| `backend/app/core/errors.py` | `ANALYSIS_FAILED` 추가 |
| `backend/app/main.py` | analyze 라우터 등록 |
| `frontend/src/types/index.ts` | AnalysisStep, KeyResult, BpmResult, LoudnessResult, AnalysisResult 타입 추가 |
| `frontend/src/services/api.ts` | `apiService.analyze(fileId)` 추가 |
| `frontend/src/hooks/useTrimPlayback.ts` | `useAudioPlayback` re-export로 교체 (하위 호환) |
| `frontend/src/components/icons/Icon.tsx` | `IconName` 타입 export 추가; metronome/gauge/list 아이콘 추가 |
| `frontend/src/pages/AnalyzePage/index.tsx` | 전면 재작성 |
| `frontend/src/pages/CutPage/index.tsx` | UploadCard + useAudioPlayback 적용 |
| `frontend/src/components/result/FileMetaCard.tsx` | utils/format import 사용 |

---

## P4에서 재사용 가능한 공통 인프라

### 컴포넌트

```tsx
// P4 페이지에서 업로드 카드 사용 예시
import { UploadCard } from '../../components/upload/UploadCard'

<UploadCard
  inputId="keyshift-file-input"   // 페이지별 고유 id
  uploadedFile={uploadedFile}
  pageStatus={pageStatus}
  errorMsg={errorMsg}
  onUploadSuccess={handleUploadSuccess}
  onUploadError={handleUploadError}
  onClear={handleClear}
/>
```

### 훅

```ts
// 오디오 재생 훅 (playFrom / stop / seek / volume)
import { useAudioPlayback } from '../../hooks/useAudioPlayback'
const playback = useAudioPlayback(audioSrc)
```

### 포맷 유틸

```ts
// 포맷 헬퍼 — 페이지 내부에서 직접 정의 금지
import { formatBytes, formatDuration, formatSampleRate, formatBitrate } from '../../utils/format'
```

### 아이콘 타입

```tsx
// FootNotice, 배지 등에서 아이콘 이름 타입 사용
import type { IconName } from '../../components/icons/Icon'
```

---

## 핵심 패턴 — P4에서도 그대로 유지

### 백엔드: 외부 프로세스 호출

```python
# Rubber Band CLI 포함 모든 외부 프로세스
import asyncio, subprocess

result = await asyncio.to_thread(
    subprocess.run,
    ['rubberband', '--pitch', str(semitones), input_path, output_path],
    capture_output=True,
)
# asyncio.create_subprocess_exec 절대 사용 금지 (Windows NotImplementedError)
```

### 백엔드: 에러 코드 추가

```python
# backend/app/core/errors.py 에만 추가
KEY_SHIFT_FAILED = "KEY_SHIFT_FAILED"
```

### 백엔드: 파일명 정책

```python
# backend/app/core/filename_policy.py 에만 정의
def key_shift_filename(original_name: str, semitones: int) -> str:
    base = sanitize_base_name(original_name)
    sign = "+" if semitones >= 0 else ""
    return f"{base}_key{sign}{semitones}.mp3"
```

### 프론트: 페이지 상태 5단계

```
empty → uploaded → processing → success
                              → error
```

### 프론트: API 응답 포맷

```json
{ "ok": true,  "data": { "artifact_id": "...", "suggested_filename": "..." }, "error": null }
{ "ok": false, "data": null, "error": { "code": "KEY_SHIFT_FAILED" } }
```

---

## P4 착수 전 필수 확인

1. **Rubber Band CLI 설치 확인**
   ```powershell
   rubberband --version
   # 미설치 시: https://breakfastquay.com/rubberband/ 에서 Windows 바이너리 다운로드
   # rubberband.exe를 PATH 등록 또는 scripts/ 폴더에 배치
   ```

2. **디자인 시안 확정**
   - `docs/ui_design_reference/claude_design/` P4 폴더 확인

3. **P4 구현 범위 (예상)**
   - semitone 입력 UI (±12 범위, 반음 단위)
   - 변환 전/후 미리듣기
   - 결과 파일 다운로드
   - `POST /api/key-shift` 엔드포인트

---

## P3 주요 기술 이슈 (참고)

| 이슈 | 원인 | 해결책 |
|---|---|---|
| NumPy deprecation | `librosa.beat.beat_track` → `ndarray(1,)` 반환 | `float(np.asarray(tempo).item())` |
| Tailwind border-line2 | `line: { 2: '...' }` → `border-line-2` 생성 | `line2: '#2A3358'` 플랫 키 |
| 폰트 미적용 | index.css에 Google Fonts @import 없음 | `@import url(...)` 추가 |
| text 가독성 | `text-ink-900` 토큰 없음 | `text-ink-850` 사용 |
