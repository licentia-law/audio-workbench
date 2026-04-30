// Section 5 - Part B: types
const Sec5_Types = () => (
  <>
    <DocH3>5-2. 타입 정의</DocH3>
    <Code>{`// types/audio.ts
export type PageState = 'empty' | 'uploaded' | 'processing' | 'success' | 'error';

export interface AudioFile {
  name: string;          // 'song.mp3'
  baseName: string;      // 'song'
  size: number;
  durationSec: number;
  mime: 'audio/mpeg';
  sampleRate: number;
  bitrate: number;
  blob: Blob;
}

export interface AudioStats {
  rmsDbfs: number;       // 원본 RMS dBFS, e.g. -14.2
  peakDbfs: number;
}

export interface AmpSettings {
  gainDb: number;        // -20 ~ +20, default 0
  antiClip: boolean;     // limiter on/off
}

export interface AmpResult {
  blob: Blob;
  filename: string;      // 'song(+6.0dB).mp3'
  durationSec: number;
  sizeBytes: number;
  stats: AudioStats;
}

export interface AmpValidation {
  hasFile: boolean;
  willClip: boolean;     // origDbfs + gainDb > 0
  overAmplified: boolean;// gainDb > 12
}`}</Code>
  </>
);
window.Sec5_Types = Sec5_Types;
