import type { ApiResponse, FileMeta, CutResult, AnalysisResult } from '../types'

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
}
