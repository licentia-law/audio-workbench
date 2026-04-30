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
