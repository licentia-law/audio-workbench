import type { UploadStatus } from '../../types'

interface ControlBarProps {
  state: UploadStatus
  canCut: boolean
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
  onPreviewStart: () => void
  onPreviewEnd: () => void
  onCut: () => void
}

interface ActionBtnProps {
  label: string
  onClick?: () => void
  disabled?: boolean
  primary?: boolean
  icon: React.ReactNode
}

function ActionBtn({ label, onClick, disabled, primary, icon }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'h-12 px-4 rounded-lg inline-flex items-center justify-center gap-2 text-[13.5px] font-medium border transition-colors select-none',
        primary
          ? 'bg-brand-cyan text-ink-800 border-brand-cyan hover:bg-brand-cyanDeep disabled:bg-ink-500 disabled:text-fg-mute disabled:border-line'
          : 'bg-ink-700 text-fg border-line/80 hover:bg-ink-600 disabled:bg-ink-700 disabled:text-fg-faint disabled:border-line',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  )
}

const PlayIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M3 2.5l10 5.5-10 5.5V2.5z" />
  </svg>
)

const StopIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <rect x="3" y="3" width="10" height="10" rx="1" />
  </svg>
)

const PreviewStartIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <rect x="2" y="3" width="2" height="10" rx="0.5" />
    <path d="M6 3.5l8 4.5-8 4.5V3.5z" />
  </svg>
)

const PreviewEndIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M2 3.5l8 4.5-8 4.5V3.5z" />
    <rect x="12" y="3" width="2" height="10" rx="0.5" />
  </svg>
)

const ScissorsIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <circle cx="4.5" cy="4.5" r="1.8" />
    <circle cx="4.5" cy="11.5" r="1.8" />
    <line x1="6.2" y1="5.3" x2="13" y2="11" />
    <line x1="6.2" y1="10.7" x2="13" y2="5" />
  </svg>
)

const SpinnerIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 animate-spin">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
    <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export function ControlBar({
  state,
  canCut,
  isPlaying,
  onPlay,
  onStop,
  onPreviewStart,
  onPreviewEnd,
  onCut,
}: ControlBarProps) {
  const noFile = state === 'empty'
  const isProcessing = state === 'processing'
  const playbackDisabled = noFile || isProcessing
  const cutDisabled = isProcessing || (!canCut && state !== 'success' && state !== 'error')

  return (
    <div className="grid grid-cols-5 gap-3">
      <ActionBtn
        icon={<PlayIcon />}
        label={isPlaying ? '재생 중' : '원본 재생'}
        disabled={playbackDisabled}
        onClick={onPlay}
      />
      <ActionBtn
        icon={<StopIcon />}
        label="정지"
        disabled={playbackDisabled}
        onClick={onStop}
      />
      <ActionBtn
        icon={<PreviewStartIcon />}
        label="시작점 미리듣기"
        disabled={playbackDisabled}
        onClick={onPreviewStart}
      />
      <ActionBtn
        icon={<PreviewEndIcon />}
        label="종료점 미리듣기"
        disabled={playbackDisabled}
        onClick={onPreviewEnd}
      />
      <ActionBtn
        icon={isProcessing ? <SpinnerIcon /> : <ScissorsIcon />}
        label={isProcessing ? '자르는 중…' : '자르기 실행'}
        primary
        disabled={cutDisabled}
        onClick={onCut}
      />
    </div>
  )
}
