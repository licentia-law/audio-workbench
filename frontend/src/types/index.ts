export type UploadStatus = 'empty' | 'uploaded' | 'processing' | 'success' | 'error'

export interface FileMeta {
  file_id: string
  original_name: string
  size_bytes: number
  duration_seconds: number
}

export interface ApiResponse<T = unknown> {
  ok: boolean
  message: string
  data: T | null
  error: { code: string } | null
}
