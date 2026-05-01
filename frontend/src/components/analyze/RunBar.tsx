import type { UploadStatus } from '../../types'
import { Icon } from '../icons/Icon'

interface RunBarProps {
  state: UploadStatus
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
  onRun: () => void
}

const SpinnerIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 animate-spin">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
    <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export function RunBar({ state, isPlaying, onPlay, onStop, onRun }: RunBarProps) {
  const noFile = state === 'empty'
  const isProcessing = state === 'processing'

  const playDisabled = noFile || isProcessing
  const runDisabled = noFile || isProcessing

  const runLabel =
    state === 'processing' ? '분석 중…' :
    state === 'success'    ? '다시 분석' :
    state === 'error'      ? '다시 시도' : '분석 실행'

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card mt-5 p-3 pl-4 flex items-center justify-between gap-3">
      {/* 원본 재생 / 정지 */}
      <button
        type="button"
        disabled={playDisabled}
        onClick={isPlaying ? onStop : onPlay}
        className="h-12 px-5 rounded-lg inline-flex items-center gap-2 text-[13.5px] font-medium border bg-ink-700 text-fg border-line2 hover:bg-ink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Icon name={isPlaying ? 'pause' : 'play'} className="w-4 h-4" />
        {isPlaying ? '재생 중' : '원본 재생'}
      </button>

      {/* 분석 실행 */}
      <button
        type="button"
        disabled={runDisabled}
        onClick={onRun}
        className="h-12 px-5 rounded-lg inline-flex items-center gap-2 text-[13.5px] font-medium border bg-brand-cyan text-ink-850 border-brand-cyan hover:bg-brand-cyan/90 disabled:bg-ink-500 disabled:text-fg-mute disabled:border-line2 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? <SpinnerIcon /> : <Icon name="analyze" className="w-4 h-4" />}
        {runLabel}
      </button>
    </div>
  )
}
