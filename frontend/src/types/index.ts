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
