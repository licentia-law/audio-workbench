/**
 * AmpResultCard
 * Shows processing progress or final success result with download button.
 * States: processing | success | error (empty/uploaded → null 반환)
 */
import { Icon } from '../icons/Icon'
import { formatBytes, formatDuration, formatGainDb } from '../../utils/format'
import type { AmpResult } from '../../types'

interface AmpResultCardProps {
  pageStatus: 'empty' | 'uploaded' | 'processing' | 'success' | 'error'
  result: AmpResult | null
  gainDb: number
  errorMsg: string | null
}

export function AmpResultCard({ pageStatus, result, gainDb, errorMsg }: AmpResultCardProps) {
  if (pageStatus === 'empty' || pageStatus === 'uploaded') return null

  if (pageStatus === 'processing') {
    return (
      <div className="bg-ink-800 rounded-2xl border border-line2/40 p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse" />
          <span className="text-[13.5px] font-medium text-fg">음량 변환 중</span>
          <span className="ml-auto text-[12px] text-fg-dim">{formatGainDb(gainDb)} 적용 중</span>
        </div>
        <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
          <div className="h-full bg-brand-cyan rounded-full animate-pulse w-2/3" />
        </div>
      </div>
    )
  }

  if (pageStatus === 'error') {
    return (
      <div className="bg-err/6 rounded-2xl border border-err/30 p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-err/15 grid place-items-center shrink-0">
          <Icon name="error" className="w-4.5 h-4.5 text-err" />
        </div>
        <div>
          <div className="text-[13px] font-medium text-err">변환 실패</div>
          <div className="text-[12px] text-fg-dim mt-0.5">{errorMsg ?? '알 수 없는 오류가 발생했습니다.'}</div>
        </div>
      </div>
    )
  }

  if (pageStatus === 'success' && result) {
    return (
      <div className="bg-ink-800 rounded-2xl border border-ok/30 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-ok/15 grid place-items-center">
            <Icon name="circle-check" className="w-4 h-4 text-ok" />
          </div>
          <span className="text-[13.5px] font-semibold text-ok">변환 완료</span>
          <span className="ml-auto text-[12px] text-fg-dim">{formatGainDb(gainDb)} 적용됨</span>
        </div>

        {/* File info */}
        <div className="flex items-center gap-3 bg-ink-700/60 rounded-xl px-3.5 py-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 grid place-items-center shrink-0">
            <Icon name="file" className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-medium text-fg truncate">{result.suggestedFilename}</div>
            <div className="text-[11px] text-fg-dim mt-0.5">
              {formatDuration(result.durationSec)} · {formatBytes(result.sizeBytes)}
            </div>
          </div>
        </div>

        {/* Output stats */}
        {(result.stats.peakDbfs != null || result.stats.rmsDbfs != null) && (
          <div className="grid grid-cols-2 gap-2">
            {result.stats.peakDbfs != null && (
              <div className="bg-ink-700/50 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] text-fg-dim uppercase tracking-wider">Peak</div>
                <div className="text-[15px] font-semibold tabular-nums mt-0.5 text-fg">
                  {result.stats.peakDbfs >= 0 ? '+' : ''}{result.stats.peakDbfs.toFixed(1)}
                  <span className="text-[10px] font-normal text-fg-dim ml-0.5">dBFS</span>
                </div>
              </div>
            )}
            {result.stats.rmsDbfs != null && (
              <div className="bg-ink-700/50 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] text-fg-dim uppercase tracking-wider">RMS</div>
                <div className="text-[15px] font-semibold tabular-nums mt-0.5 text-fg">
                  {result.stats.rmsDbfs >= 0 ? '+' : ''}{result.stats.rmsDbfs.toFixed(1)}
                  <span className="text-[10px] font-normal text-fg-dim ml-0.5">dBFS</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Download */}
        <a
          href={`/api/download/${result.artifactId}`}
          download={result.suggestedFilename}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl
            bg-brand-cyan text-ink-850 font-semibold text-[13.5px] hover:bg-cyan-300
            transition-colors shadow-md shadow-brand-cyan/20"
        >
          <Icon name="download" className="w-4 h-4" />
          다운로드
        </a>
      </div>
    )
  }

  return null
}
