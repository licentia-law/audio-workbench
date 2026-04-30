import type { UploadStatus } from '../../types'
import { Icon } from '../icons/Icon'

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
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'h-12 px-4 rounded-lg inline-flex items-center justify-center gap-2 text-[13.5px] font-medium border transition-colors select-none',
        primary
          ? 'bg-brand-cyan text-ink-850 border-brand-cyan hover:bg-brand-cyan/90 disabled:bg-ink-500 disabled:text-fg-mute disabled:border-line2'
          : 'bg-ink-700 text-fg border-line2 hover:bg-ink-600 disabled:bg-ink-700 disabled:text-fg-faint disabled:border-line',
        disabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  )
}

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
        icon={<Icon name={isPlaying ? 'pause' : 'play'} className="w-4 h-4" />}
        label={isPlaying ? '재생 중' : '원본 재생'}
        disabled={playbackDisabled}
        onClick={onPlay}
      />
      <ActionBtn
        icon={<Icon name="stop" className="w-4 h-4" />}
        label="정지"
        disabled={playbackDisabled}
        onClick={onStop}
      />
      <ActionBtn
        icon={<Icon name="skip-start" className="w-4 h-4" />}
        label="시작점 미리듣기"
        disabled={playbackDisabled}
        onClick={onPreviewStart}
      />
      <ActionBtn
        icon={<Icon name="skip-end" className="w-4 h-4" />}
        label="종료점 미리듣기"
        disabled={playbackDisabled}
        onClick={onPreviewEnd}
      />
      <ActionBtn
        icon={isProcessing ? <SpinnerIcon /> : <Icon name="scissors" className="w-4 h-4" />}
        label={isProcessing ? '자르는 중…' : '자르기 실행'}
        primary
        disabled={cutDisabled}
        onClick={onCut}
      />
    </div>
  )
}
