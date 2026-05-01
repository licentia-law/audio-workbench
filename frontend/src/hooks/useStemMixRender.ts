/**
 * useStemMixRender
 * POST /api/stems/mix 호출 → 완료 시 자동 다운로드 트리거.
 */
import { useState } from 'react'
import { apiService } from '../services/api'
import type { StemId, StemInfo, MixerState, StemMixResult } from '../types'
import { STEM_IDS } from './useStemSeparation'

export interface RenderMixParams {
  stems: Record<StemId, StemInfo>
  mixerState: MixerState
  originalName: string
}

interface UseStemMixRenderReturn {
  rendering: boolean
  renderResult: StemMixResult | null
  renderErrorMsg: string | null
  renderMix: (params: RenderMixParams) => void
}

export function useStemMixRender(): UseStemMixRenderReturn {
  const [rendering,      setRendering]      = useState(false)
  const [renderResult,   setRenderResult]   = useState<StemMixResult | null>(null)
  const [renderErrorMsg, setRenderErrorMsg] = useState<string | null>(null)

  function renderMix(params: RenderMixParams) {
    let cancelled = false
    setRendering(true)
    setRenderResult(null)
    setRenderErrorMsg(null)

    const { stems, mixerState, originalName } = params

    // 뮤트 해제 + 솔로 로직 반영 스템만 active_stems에 포함
    // Solo가 있으면 솔로 채널만, 없으면 뮤트 해제 채널만
    const anySolo = STEM_IDS.some(id => mixerState.channels[id].solo)
    const activeStems = STEM_IDS.filter(id => {
      const { muted, solo } = mixerState.channels[id]
      if (muted) return false
      if (anySolo && !solo) return false
      return true
    })

    // stem_artifact_ids: stem_id → artifact_id
    const stemArtifactIds = Object.fromEntries(
      STEM_IDS.map(id => [id, stems[id].artifactId])
    ) as Record<StemId, string>

    // gain_db: 솔로 로직은 백엔드 amix 단계에서 active_stems로 제어
    const gainDb = Object.fromEntries(
      STEM_IDS.map(id => [id, mixerState.channels[id].gainDb])
    ) as Record<StemId, number>

    apiService.renderStemMix({
      stemArtifactIds,
      gainDb,
      masterDb: mixerState.masterDb,
      activeStems,
      originalName,
    })
      .then(result => {
        if (cancelled) return
        setRenderResult(result)

        // 자동 다운로드 트리거
        const a = document.createElement('a')
        a.href = `/api/download/${result.artifactId}`
        a.download = result.suggestedFilename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      })
      .catch(err => {
        if (cancelled) return
        setRenderErrorMsg(err instanceof Error ? err.message : '믹스 렌더에 실패했습니다.')
      })
      .finally(() => {
        if (!cancelled) setRendering(false)
      })

    return () => { cancelled = true }
  }

  return { rendering, renderResult, renderErrorMsg, renderMix }
}
