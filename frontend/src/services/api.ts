import type { ApiResponse, FileMeta, CutResult, AnalysisResult, AmpResult, KeyShiftResult, StemId, StemInfo, StemSeparateResult, StemMixResult } from '../types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)

  let json: ApiResponse<T>
  try {
    json = await res.json()
  } catch {
    throw new Error(`[HTTP_${res.status}] 서버 응답을 파싱할 수 없습니다.`)
  }

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

  async getSessionInfo(): Promise<{ session_id: string; session_dir: string }> {
    return request('/session')
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

  async keyShift(
    fileId: string,
    semitones: number,
    tonicIdx: number | null,
    mode: string | null,  // 'Major' | 'minor'
    transients: 'smooth' | 'crisp' = 'smooth',
  ): Promise<KeyShiftResult> {
    const raw = await request<{
      artifact_id: string
      suggested_filename: string
      duration_seconds: number
      size_bytes: number
    }>('/key-shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_id: fileId,
        semitones,
        tonic_idx: tonicIdx,
        mode,
        transients,
      }),
    })
    return {
      artifactId: raw.artifact_id,
      suggestedFilename: raw.suggested_filename,
      durationSec: raw.duration_seconds,
      sizeBytes: raw.size_bytes,
    }
  },

  async separateStems(fileId: string): Promise<StemSeparateResult> {
    const raw = await request<{
      stems: Record<string, {
        artifact_id: string
        suggested_filename: string
        size_bytes: number
        duration_sec: number
      }>
    }>('/stems/separate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId }),
    })
    // snake_case → camelCase
    const stems = Object.fromEntries(
      Object.entries(raw.stems).map(([id, s]) => [
        id,
        {
          artifactId: s.artifact_id,
          suggestedFilename: s.suggested_filename,
          sizeBytes: s.size_bytes,
          durationSec: s.duration_sec,
        } satisfies StemInfo,
      ])
    ) as Record<StemId, StemInfo>
    return { stems }
  },

  async renderStemMix(params: {
    stemArtifactIds: Record<StemId, string>
    gainDb: Record<StemId, number>
    masterDb: number
    activeStems: StemId[]
    originalName: string
  }): Promise<StemMixResult> {
    const raw = await request<{
      artifact_id: string
      suggested_filename: string
      size_bytes: number
      duration_sec: number
    }>('/stems/mix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stem_artifact_ids: params.stemArtifactIds,
        gain_db: params.gainDb,
        master_db: params.masterDb,
        active_stems: params.activeStems,
        original_name: params.originalName,
      }),
    })
    return {
      artifactId: raw.artifact_id,
      suggestedFilename: raw.suggested_filename,
      sizeBytes: raw.size_bytes,
      durationSec: raw.duration_sec,
    }
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
