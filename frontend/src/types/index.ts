export type UploadStatus = 'empty' | 'uploaded' | 'processing' | 'success' | 'error'

export interface FileMeta {
  file_id: string
  original_name: string
  size_bytes: number
  duration_seconds: number
  sample_rate?: number | null
  bit_rate?: number | null
}

export interface ApiResponse<T = unknown> {
  ok: boolean
  message: string
  data: T | null
  error: { code: string } | null
}

export interface TrimSelection {
  startSec: number
  endSec: number
}

export interface CutResult {
  artifact_id: string
  suggested_filename: string
  duration_seconds: number
  size_bytes: number
}

export type StepStatus = 'idle' | 'active' | 'done' | 'error'
export type StepKey = 'decode' | 'peaks' | 'key' | 'bpm' | 'loudness'

export interface AnalysisStep {
  key: StepKey
  label: string
  status: StepStatus
  progress: number
}

export interface KeyResult {
  pretty: string
  tonic: string | null
  mode: 'major' | 'minor' | null
  confidence: number
  unknown: boolean
}

export interface BpmResult {
  bpm: number | null
  confidence: number
  unknown: boolean
}

export interface LoudnessResult {
  peak_db: number
  rms_db: number
}

export interface AnalysisResult {
  key: KeyResult
  bpm: BpmResult
  loudness: LoudnessResult
  duration_seconds: number
}

export interface KeyShiftResult {
  artifactId: string
  suggestedFilename: string
  durationSec: number
  sizeBytes: number
}

// ── Stem types ───────────────────────────────────────────────────────────────

export type StemId = 'vocals' | 'drums' | 'bass' | 'other'

export interface StemInfo {
  artifactId: string
  suggestedFilename: string
  sizeBytes: number
  durationSec: number
}

export interface StemTrack {
  id: StemId
  blob: Blob
  url: string        // URL.createObjectURL — 미리듣기용 (내부 사용)
  peaks: number[]    // 0~1, 220 포인트 (결정론적 생성)
  durationSec: number
}

export interface ChannelState {
  gainDb: number     // -24 ~ +12
  muted: boolean
  solo: boolean
}

export interface MixerState {
  channels: Record<StemId, ChannelState>
  masterDb: number   // -24 ~ +12
}

export interface StemSeparateResult {
  stems: Record<StemId, StemInfo>
}

export interface StemMixResult {
  artifactId: string
  suggestedFilename: string
  sizeBytes: number
  durationSec: number
}

export interface AmpStats {
  rmsDbfs: number | null
  peakDbfs: number | null
}

export interface AmpResult {
  artifactId: string
  suggestedFilename: string
  durationSec: number
  sizeBytes: number
  stats: AmpStats
}
