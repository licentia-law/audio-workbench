// Section 5 - Part B: types & state machine
const Sec5_Types = () => (
  <>
    <DocH3>5-2. 타입 정의</DocH3>
    <Code>{`// types/audio.ts
export type PageState = 'empty' | 'uploaded' | 'processing' | 'success' | 'error';

export interface AudioFile {
  name: string;          // 'song.mp3'
  size: number;          // bytes
  durationSec: number;   // 222
  mime: 'audio/mpeg';
  sampleRate: number;    // 44100
  bitrate: number;       // 320000
  blob: Blob;
}

export interface TrimSelection {
  startSec: number;
  endSec: number;
  playSec: number;       // 현재 재생 헤드
}

export interface TrimResult {
  blob: Blob;
  filename: string;      // 'song(cut).mp3'
  durationSec: number;
  sizeBytes: number;
}

export interface ValidationFlags {
  order: boolean;        // start < end
  minLen: boolean;       // (end - start) >= 1.0s
  hasFile: boolean;
}`}</Code>
  </>
);
window.Sec5_Types = Sec5_Types;
