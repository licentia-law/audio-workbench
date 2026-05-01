import type { ApiResponse, FileMeta, CutResult, AnalysisResult, AmpResult } from '../types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  const json: ApiResponse<T> = await res.json()

  if (!json.ok) {
    const code = json.error?.code ?? 'UNKNOWN'
    throw new Error(`[${code}] ${json.message}`)
  }

  return json.data as T
}

export const apiService = {
  async upload(file: File): Promise<FileMeta> {
    const form = new FormData()
    form.append('file', file)
    return request<FileMeta>('/upload', { method: 'POST', body: form })
  },

  async getFileMeta(fileId: string): Promise<FileMeta> {
    return request<FileMeta>(`/file/${fileId}/meta`)
  },

  async getWaveform(fileId: string): Promise<{ file_id: string; peaks: number[] }> {
    return request(`/file/${fileId}/waveform`)
  },

  async deleteSession(sessionId: string): Promise<void> {
    await request(`/session/${sessionId}`, { method: 'DELETE' })
  },

  async cut(fileId: string, params: { start_sec: number; end_sec: number }): Promise<CutResult> {
    return request<CutResult>('/cut', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId, ...params }),
    })
  },

  async analyze(fileId: string): Promise<AnalysisResult> {
    return request<AnalysisResult>('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId }),
    })
  },

  async amplify(
    fileId: string,
    gainDb: number,
    antiClip: boolean,
  ): Promise<AmpResult> {
    const raw = await request<{
      artifact_id: string
      suggested_filename: string
      duration_seconds: number
      size_bytes: number
      rms_dbfs: number | null
      peak_dbfs: number | null
    }>('/amplify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId, gain_db: gainDb, anti_clip: antiClip }),
    })
    return {
      artifactId: raw.artifact_id,
      suggestedFilename: raw.suggested_filename,
      durationSec: raw.duration_seconds,
      sizeBytes: raw.size_bytes,
      stats: { rmsDbfs: raw.rms_dbfs, peakDbfs: raw.peak_dbfs },
    }
  },
}
