// === Spec doc — Section 5-1: file tree ===
const Sec5_Tree = () => (
  <>
    <DocH3>5-1. 파일 트리</DocH3>
    <Code>{`src/
  pages/
    AnalyzePage.tsx             # 2페이지 컨테이너
  components/
    common/
      Sidebar.tsx
      PageHeader.tsx
      Badge.tsx
      ActionButton.tsx
      UploadFileCard.tsx
      FootNotice.tsx
    analyze/
      RunBar.tsx
      ResultBigCard.tsx         # Key / BPM 빅 넘버
      NoticeCard.tsx
      LoudnessCard.tsx          # Peak / RMS dBFS
      StepListCard.tsx          # 디코딩→피크→Key→BPM→음량
  hooks/
    useAudioFile.ts             # 1페이지에서 공유
    useAnalysisJob.ts           # 분석 단계 상태머신
    useAudioPlayback.ts         # 1페이지에서 공유
  lib/
    audio/decode.ts             # 공통
    audio/peaks.ts              # 공통
    audio/keyDetect.ts          # chroma profile 매칭
    audio/bpmDetect.ts          # onset + autocorr
    audio/loudness.ts           # peak / rms dBFS
    format.ts
  types/
    audio.ts                    # AudioFile, AnalysisResult, AnalysisStep`}</Code>
  </>
);

// === Spec doc — Section 5-2: types ===
const Sec5_Types = () => (
  <>
    <DocH3>5-2. 타입 정의</DocH3>
    <Code>{`// types/audio.ts
export type PageState = 'empty' | 'uploaded' | 'processing' | 'success' | 'error';

export type StepStatus = 'idle' | 'active' | 'done' | 'error';
export type StepKey = 'decode' | 'peaks' | 'key' | 'bpm' | 'loudness';

export interface AnalysisStep {
  key: StepKey;
  label: string;
  status: StepStatus;
  progress: number;     // 0..1
}

export interface KeyResult {
  pretty: string;       // 'A minor', 'F# Major', 'Unknown'
  tonic: string | null; // 'A'
  mode: 'major' | 'minor' | null;
  confidence: number;   // 0..1
  unknown: boolean;
}

export interface BpmResult {
  bpm: number | null;   // 128
  confidence: number;
  unknown: boolean;
}

export interface LoudnessResult {
  peakDb: number;       // -1.4
  rmsDb: number;        // -14.8
}

export interface AnalysisResult {
  key: KeyResult;
  bpm: BpmResult;
  loudness: LoudnessResult;
  durationSec: number;
  analyzedAt: number;
}`}</Code>
  </>
);

window.Sec5_Tree = Sec5_Tree;
window.Sec5_Types = Sec5_Types;
