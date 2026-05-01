/**
 * OriginalInfoCard
 * 분석된 원본 Key/BPM 표시 + 원본 재생 버튼.
 * analyzeLoading: 분석 중 — 점 애니메이션으로 대기 상태 표현.
 */
import { Icon } from '../icons/Icon'
import type { UploadStatus } from '../../types'

interface OriginalInfoCardProps {
  pageStatus: UploadStatus
  keyDisplay: string          // 'A minor' | 'Unknown' | '--'
  bpm: number | null
  isKeyUnknown: boolean
  analyzeLoading: boolean
  isPlaying: boolean
  onPlayToggle: () => void
}

export function OriginalInfoCard({
  pageStatus,
  keyDisplay,
  bpm,
  isKeyUnknown,
  analyzeLoading,
  isPlaying,
  onPlayToggle,
}: OriginalInfoCardProps) {
  const noFile = pageStatus === 'empty'
  const canPlay = !noFile && pageStatus !== 'processing'

  return (
    <div className="rounded-2xl border border-line bg-ink-700 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon name="wave" className="w-4 h-4 text-brand-cyan" />
        <span className="text-[14px] font-semibold tracking-tight">원본 정보</span>
        {isKeyUnknown && !noFile && !analyzeLoading && (
          <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-warn/15 text-warn font-medium">
            분석 신뢰도 낮음
          </span>
        )}
        {analyzeLoading && (
          <span className="ml-auto text-[11px] text-fg-dim animate-pulse">분석 중…</span>
        )}
      </div>

      {/* Key / BPM */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-ink-800 border border-line2/50 px-4 py-3">
          <div className="text-[11px] text-fg-dim mb-1.5">원본 Key</div>
          <div className={`text-[20px] font-semibold tracking-tight leading-none ${
            noFile
              ? 'text-fg-faint'
              : analyzeLoading
              ? 'text-fg-faint animate-pulse'
              : isKeyUnknown
              ? 'text-fg-dim'
              : 'text-brand-cyan'
          }`}>
            {noFile ? '--' : analyzeLoading ? '…' : keyDisplay}
          </div>
        </div>

        <div className="rounded-xl bg-ink-800 border border-line2/50 px-4 py-3">
          <div className="text-[11px] text-fg-dim mb-1.5">원본 BPM</div>
          <div className={`text-[20px] font-semibold tracking-tight leading-none tabular-nums ${
            noFile || analyzeLoading ? 'text-fg-faint' : 'text-fg'
          }`}>
            {noFile ? '--' : analyzeLoading ? '…' : (bpm != null ? Math.round(bpm) : '--')}
          </div>
        </div>
      </div>

      {/* Play button */}
      <button
        disabled={!canPlay}
        onClick={onPlayToggle}
        className={`mt-auto h-10 rounded-lg flex items-center justify-center gap-2 text-[13px] font-medium border transition-colors ${
          canPlay
            ? 'bg-ink-700 text-fg border-line2 hover:bg-ink-600'
            : 'bg-ink-700 text-fg-faint border-line cursor-not-allowed'
        }`}
      >
        <Icon name={isPlaying ? 'pause' : 'play'} className="w-4 h-4" />
        {isPlaying ? '재생 중지' : '원본 재생'}
      </button>
    </div>
  )
}
