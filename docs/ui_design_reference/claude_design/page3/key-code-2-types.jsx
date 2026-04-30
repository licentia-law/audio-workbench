// Section 5 - Part B: types & state machine
const Sec5_Types = () => (
  <>
    <DocH3>5-2. 타입 정의</DocH3>
    <Code>{`// types/audio.ts
export type KeyState = 'empty' | 'uploaded' | 'processing' | 'success' | 'error';

export interface AudioFile {
  name: string;          // 'song.mp3'
  size: number;
  durationSec: number;   // 222
  mime: 'audio/mpeg';
  sampleRate: number;
  bitrate: number;
  blob: Blob;
}

export interface KeyAnalysis {
  rootIdx: number | null;   // 0..11 (C..B), null = Unknown
  mode: 'Major' | 'minor' | null;
  bpm: number | null;
  display: string;          // 'A minor' | 'Unknown'
}

export interface KeyShift {
  semi: number;             // -12 ~ +12, 0 = no change
}

export interface KeyResult {
  blob: Blob;
  filename: string;         // 'song(C_minor).mp3' | 'song(key_shift_+3).mp3'
  targetKey: string;        // 'C minor' | 'Unknown'
  semi: number;
  durationSec: number;
}

export interface ValidationFlags {
  hasFile: boolean;
  inRange: boolean;         // -12 ≤ semi ≤ 12
  changed: boolean;         // semi !== 0
}`}</Code>
  </>
);
window.Sec5_Types = Sec5_Types;
