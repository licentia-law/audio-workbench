# P5 (스템 분리/믹스) 프롬프트 작성용 인수인계 문서

> P4 음량 증폭 완료 기준 — 실제 구현 파일에서 추출한 정확한 인터페이스/패턴.
> P5 프롬프트 작성 및 P5 작업 착수 전 이 문서를 먼저 읽을 것.

---

## 1. P4 완성 파일 전체 목록

### Backend (신규/수정)

| 파일 | 역할 |
|------|------|
| `backend/app/services/amplify_service.py` | ffmpeg volume + alimiter, volumedetect stderr 파싱으로 RMS/Peak 측정 |
| `backend/app/api/routes/amplify.py` | `POST /api/amplify` — JSON body `{ file_id, gain_db: float[-20~+20], anti_clip: bool }` |
| `backend/app/core/filename_policy.py` | `amp_filename(name, gain_db)` 추가 — `song(+6dB).mp3` / `song(-3.5dB).mp3` |
| `backend/app/core/errors.py` | `AMPLIFY_FAILED` 추가 |
| `backend/app/main.py` | amplify 라우터 등록 (`/api/amplify`) |

### Frontend (신규)

| 파일 | 역할 |
|------|------|
| `frontend/src/hooks/useGainPreview.ts` | Web Audio GainNode + AnalyserNode, AnimationFrame 레벨 미터 |
| `frontend/src/lib/audio/dbfs.ts` | `linToDb`, `dbToLin`, `computeStats(AudioBuffer)`, `dbToPct` |
| `frontend/src/lib/audio/amplify.ts` | `createPreviewChain` 헬퍼 |
| `frontend/src/components/amplify/GainSliderPanel.tsx` | -20~+20 dB 슬라이더, center notch, zone 색상, Anti-Clip 토글 |
| `frontend/src/components/amplify/LevelMeterPanel.tsx` | 32-세그먼트 수직 LED 미터 (cyan/amber/red 구간) |
| `frontend/src/components/amplify/AmpWaveformCard.tsx` | dim(원본)+hot(증폭) 듀얼 레이어 SVG 파형, willClip 시 hot → red |
| `frontend/src/components/amplify/AmpControlBar.tsx` | 미리듣기 / 음량변환(primary) / 초기화 3버튼 |
| `frontend/src/components/amplify/AmpResultCard.tsx` | processing/success/error 결과 카드 (empty/uploaded는 null 반환) |
| `frontend/src/components/amplify/AmpGuidanceCard.tsx` | gainDb/willClip/antiClip 기반 동적 안내 3항목 |
| `frontend/src/pages/AmplifyPage/index.tsx` | 페이지 컨테이너 |

### Frontend (수정)

| 파일 | 변경 내용 |
|------|----------|
| `frontend/src/types/index.ts` | `AmpStats { rmsDbfs, peakDbfs }`, `AmpResult { artifactId, suggestedFilename, durationSec, sizeBytes, stats }` 추가 |
| `frontend/src/services/api.ts` | `apiService.amplify(fileId, gainDb, antiClip): Promise<AmpResult>` 추가 |
| `frontend/src/utils/format.ts` | `formatGainDbNum(db)`, `formatGainDb(db)` 추가 |
| `frontend/src/components/icons/Icon.tsx` | `sparkle`, `shield`, `meter`, `wave` 아이콘 추가 |

---

## 2. P5에서 재사용 가능한 공통 인프라

### `useGainPreview` — 실제 시그니처 (`hooks/useGainPreview.ts`)

```typescript
function useGainPreview(blob: Blob | null): {
  isLoaded: boolean
  isPlaying: boolean
  level: number             // 0~1 linear peak (AnimationFrame 갱신)
  originalPeakLin: number   // 디코딩 직후 측정한 원본 peak 선형값 (willClip 판정용)
  setGainDb: (db: number) => void
  play: () => void
  stop: () => void
}
```
- AudioContext + GainNode + AnalyserNode 체인. `blob` 변경 시 자동 재디코딩
- **P5에서 채널별 미리듣기 훅 설계 시 이 구조 참고**

### `lib/audio/dbfs.ts` — 실제 내보내기

```typescript
linToDb(lin: number): number                                 // linear → dBFS (-Infinity if lin≤0)
dbToLin(db: number): number                                  // dBFS → linear
computeStats(buf: AudioBuffer): { rms: number; peak: number } // 모든 채널 최댓값, dBFS 반환
dbToPct(db: number, floor?: number): number                  // dBFS → 0~1 (floor 기본 -48)
```
- **P5 채널/마스터 레벨 미터에 그대로 재사용**

### `utils/format.ts` — 신규 추가 함수

```typescript
formatGainDbNum(db: number): string   // "+6" | "-3.5" | "0"  (단위 없음, 큰 숫자 표시용)
formatGainDb(db: number): string      // "+6 dB" | "-3.5 dB"  (단위 포함, 레이블/결과용)
// 기존: formatBytes, formatDuration, formatSampleRate, formatBitrate
```
- **P5 마스터/채널 dB 표시, 결과 파일 정보에 재사용**

### 기존 공통 인프라 (P2~P4 확립)

```typescript
// 업로드 카드
import { UploadCard } from '../../components/upload/UploadCard'
<UploadCard inputId="stem-file-input" ... />

// HTMLAudioElement 기반 단일 파일 재생
import { useAudioPlayback } from '../../hooks/useAudioPlayback'

// 아이콘 — P5용 신규 아이콘은 stems-icons.jsx 기준으로 추가
import { Icon } from '../../components/icons/Icon'
// P4에서 추가된 아이콘: sparkle | shield | meter | wave
```

---

## 3. 핵심 패턴 (P4에서 확정 — P5에서 반드시 유지)

### ① gainDb/채널 볼륨 상태 소유 원칙

```typescript
// ✅ 페이지 컴포넌트(또는 전용 훅)가 dB 상태 소유
// Web Audio 훅은 setGainDb(db) 메서드만 제공 — GainNode를 즉시 반영
function handleGainChange(db: number) {
  setGainDb(db)          // React state → 리렌더 (UI 반영)
  preview.setGainDb(db)  // GainNode.gain.value 즉시 반영 (재생 중 청감 변화)
}

// ❌ Web Audio 훅 내부에서 gainDb useState 관리 금지
// (React state는 비동기 → GainNode 즉시 반영 불가)
```
→ **P5 `useStemMixer`의 채널별 gainDb도 동일 원칙 적용**

### ② willClip 정확 판정

```typescript
// ✅ AudioBuffer 디코딩 후 실제 peak 기반
const ampScale = Math.min(2.2, Math.pow(10, gainDb / 20))
const willClip = preview.originalPeakLin > 0 && preview.originalPeakLin * ampScale > 0.99

// ❌ RMS 추정 기반 금지 (RMS는 평균 — peak 클리핑 미감지)
// const willClip = (rmsDb + gainDb) > 0
```

### ③ 이벤트 핸들러 useCallback 금지

```typescript
// ✅ 일반 함수 (AmplifyPage, AnalyzePage 패턴)
function handleClear() {
  preview.stop()
  setResult(null)
  setGainDb(0)
  preview.setGainDb(0)
  setPageStatus('empty')
}

// ❌ useCallback 금지 — preview ref가 stale deps에 포착되어 클로저 버그 발생
// const handleClear = useCallback(() => { ... }, [preview, ...])
```

### ④ 결과 카드 조건부 렌더 패턴

```typescript
// AmpResultCard 실제 패턴
if (pageStatus === 'empty' || pageStatus === 'uploaded') return null
// (hidden/opacity 처리 금지 — 레이아웃 shift 방지를 위해 null 반환)
```

### ⑤ Windows asyncio 패턴 (불변)

```python
# ✅ 모든 외부 프로세스
await asyncio.to_thread(subprocess.run, cmd, capture_output=True)

# ❌ 절대 금지
await asyncio.create_subprocess_exec(...)  # uvicorn --reload → NotImplementedError
```

### ⑥ Demucs 실행 패턴 (P5 핵심)

```python
import sys

# Demucs는 module 실행 방식 — subprocess로 python -m demucs 호출
cmd = [
    sys.executable, "-m", "demucs",
    "--two-stems", "none",   # 4-stem 기본값 (vocals/drums/bass/other)
    "-n", "htdemucs",        # 최신 모델
    "--out", str(output_dir),
    str(input_path),
]
result = await asyncio.to_thread(subprocess.run, cmd, capture_output=True)
# 출력 경로: output_dir/htdemucs/{원본파일명(확장자없음)/{stem}.wav
# 형식: wav (float32) → ffmpeg libmp3lame으로 mp3 변환 필요
```

### ⑦ ffmpeg volumedetect 파싱 (amplify_service 패턴)

```python
# volumedetect는 stderr에 출력됨 (stdout 아님)
result = await asyncio.to_thread(
    subprocess.run,
    ["ffmpeg", "-y", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
    capture_output=True, text=True,
)
for line in result.stderr.splitlines():
    if "mean_volume" in line:
        rms_dbfs = float(line.split("mean_volume:")[-1].strip().split()[0])
    if "max_volume" in line:
        peak_dbfs = float(line.split("max_volume:")[-1].strip().split()[0])
```

---

## 4. P5 착수 전 체크리스트

- [ ] **Demucs 설치 확인:** `python -m demucs --help`
- [ ] **PyTorch 버전 확인:** `python -c "import torch; print(torch.__version__)"`
- [ ] **디자인 파일 전부 읽기 (구현 전)**
  - `docs/ui_design_reference/claude_design/page5/stems-spec.jsx` — 레이아웃/상태/흐름
  - `docs/ui_design_reference/claude_design/page5/stems-mixer.jsx` — StemChannel, VerticalFader, StemMiniWave JSX
  - `docs/ui_design_reference/claude_design/page5/stems-master.jsx` — StemMasterPanel, StemNoticeCard JSX
  - `docs/ui_design_reference/claude_design/page5/stems-code.jsx` — 타입, 컨테이너 스켈레톤, useStemMixer, lib/audio/stems.ts
  - `docs/ui_design_reference/claude_design/page5/stems-icons.jsx` — mic, drum, bass, other, mix, reset 아이콘 SVG
  - `docs/ui_design_reference/claude_design/page5/stems-app.jsx` — 전체 조합
  - `docs/ui_design_reference/claude_design/page5/Audio Adjuster - Stems.html` — 완성 화면 참고
- [ ] **Mixed 다운로드 방식 결정 전 확인**
  - 백엔드 방식 권장: `POST /api/stems/mix` — 4 stem mp3 + fader/master 값 → ffmpeg amix → mp3
  - 프론트 OfflineContext 방식은 긴 파일에서 메모리 불안정

### Mixed 다운로드 백엔드 설계 (권장)

```python
# POST /api/stems/mix body: { artifact_ids: dict[StemId, str], channels: dict, master_db: float }
# ffmpeg amix 예시 (4채널 동일 가중치)
cmd = [
    "ffmpeg", "-y",
    "-i", str(vocals_path), "-i", str(drums_path),
    "-i", str(bass_path),   "-i", str(other_path),
    "-filter_complex",
    f"[0]volume={vol0}dB[a0];[1]volume={vol1}dB[a1];"
    f"[2]volume={vol2}dB[a2];[3]volume={vol3}dB[a3];"
    f"[a0][a1][a2][a3]amix=inputs=4:normalize=0[out];"
    f"[out]volume={master_db}dB[final]",
    "-map", "[final]",
    "-codec:a", "libmp3lame", "-b:a", "192k",
    str(output_path),
]
```

---

## 5. P4 기술 이슈 목록 (재발 방지)

| 이슈 | 원인 | 해결 | P5 적용 포인트 |
|------|------|------|--------------|
| GainNode 값 미반영 | gainDb state를 훅 내부 관리 → React 비동기 업데이트 지연 | 페이지 컴포넌트가 state 소유, `setGainDb(db)` 콜백으로 즉시 반영 | useStemMixer 채널 gainDb도 동일 |
| willClip 오판정 | RMS 기반 0 dBFS 초과 판정 → 실제 peak 클리핑 미감지 | `originalPeakLin * ampScale > 0.99` 로 정확 판정 | 채널 클리핑 경고에 동일 |
| handleClear stale closure | `useCallback(fn, [preview])` → preview ref 업데이트 전 stale | 일반 함수로 변경 | P5 핸들러 전부 일반 함수 |
| AudioContext suspended | 브라우저 자동재생 정책 → ctx.state='suspended'에서 play() 무반응 | `ctx.resume()` 먼저 호출 후 `source.start()` | useStemMixer.play()에 resume() 선행 |
| Demucs 출력 형식 | Demucs 기본 출력 `.wav` (float32, 44.1kHz) | 각 stem wav → `ffmpeg -codec:a libmp3lame -b:a 192k` mp3 변환 | stem_service에서 변환 포함 |
| `animate-[progressPulse]` 미동작 | tailwind.config에 keyframe 미정의 | `animate-pulse` 표준 클래스 사용 | P5 진행률 바에도 animate-pulse |
| `text-fg-base` 무효 | tailwind config에 `fg.base` 미정의 (실제 키: `fg.DEFAULT`) | `text-fg` 사용 | P5 전체 텍스트 토큰 확인 |
| `text-ink-900` 무효 | tailwind config에 `ink.900` 미정의 (850이 최하) | `text-ink-850` 사용 | primary 버튼 텍스트에 ink-850 |

---

## 6. P5 예상 구현 범위 (stems-code.jsx 기준)

### Backend

```
backend/app/
  services/
    stem_service.py          ← Demucs 4-stem 분리 + wav→mp3 변환
    stem_mix_service.py      ← ffmpeg amix로 채널 합산 렌더
  api/routes/
    stems.py                 ← POST /api/stems/separate, POST /api/stems/mix
  core/
    filename_policy.py       ← stem_filename(base, stem_id), mix_filename(base) 추가
    errors.py                ← STEM_SEPARATION_FAILED, STEM_MIX_FAILED 추가
  main.py                    ← stems 라우터 등록
```

### Frontend

```
frontend/src/
  hooks/
    useStemSeparation.ts     ← POST /api/stems/separate + setInterval 진행 시뮬레이션
    useStemMixer.ts          ← 4 GainNode + MasterGainNode (Web Audio)
    useStemPlayback.ts       ← 4 HTMLAudioElement 동기 재생
  components/stems/
    StemUploadCard.tsx       ← 업로드 + [스템 분리 실행] 버튼 + 진행률 바
    StemChannel.tsx          ← 채널 헤더 + StemMiniWave + VerticalFader + M/S + 다운로드
    VerticalFader.tsx        ← 드래그 세로 페이더 [-24~+12 dB], 채널색 ring 노브
    StemMiniWave.tsx         ← 채널별 SVG 미니 파형 (dim + hot + playhead)
    StemMasterPanel.tsx      ← 믹스 파형 + 마스터 슬라이더 + Mixed 다운로드 (3분할)
    StemNoticeCard.tsx       ← 품질 면책 + 오류 사유 안내
  pages/StemMixPage/
    index.tsx                ← 전면 교체
  types/index.ts             ← StemId, StemTrack, ChannelState, MixerState 추가
  services/api.ts            ← stemSeparate(fileId), stemMix(artifactIds, channels, masterDb) 추가
```

### 채널 색상 토큰 (stems-code.jsx 기준, tailwind.config.js에 추가)

```javascript
stem: {
  vocals: '#A78BFA',  // violet
  drums:  '#5EE6D6',  // brand cyan (기존 brand.cyan과 동일)
  bass:   '#7C8CFF',  // brand indigo (기존 brand.indigo와 동일)
  other:  '#F2B544',  // amber (기존 warn과 동일)
}
// → 신규 토큰 대신 기존 토큰 재사용 가능: vocals만 신규 (#A78BFA)
```

### 파일명 규칙

```
개별 stem: song(vocals).mp3  song(drums).mp3  song(bass).mp3  song(other).mp3
믹스 결과: song(mixed).mp3
```

### 처리 시간 UX

Demucs는 CPU 기준 1~2분 소요 → polling 또는 setInterval 시뮬 필요.
API 응답이 오기 전까지 fake progress (0→95%)로 시각적 진행 표시.
P3 `useAnalysisJob` 패턴 참고 (setInterval + API 완료 시 전 단계 100%).

---

*작성일: 2026-05-01 | P4 완료 기준 | 실제 소스 파일 기반*
