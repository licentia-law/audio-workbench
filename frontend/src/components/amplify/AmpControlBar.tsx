/**
 * AmpControlBar
 * Three-button bar: Preview Play/Stop | Run Amplify | Reset
 */
import { Icon } from '../icons/Icon'

interface AmpControlBarProps {
  pageStatus: 'empty' | 'uploaded' | 'processing' | 'success' | 'error'
  previewLoaded: boolean
  previewPlaying: boolean
  onPreviewToggle: () => void
  onRun: () => void
  onReset: () => void
}

export function AmpControlBar({
  pageStatus,
  previewLoaded,
  previewPlaying,
  onPreviewToggle,
  onRun,
  onReset,
}: AmpControlBarProps) {
  const canPreview = previewLoaded && pageStatus === 'uploaded'
  const canRun = pageStatus === 'uploaded'
  const isProcessing = pageStatus === 'processing'

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Preview toggle */}
      <button
        onClick={onPreviewToggle}
        disabled={!canPreview || isProcessing}
        className={`flex items-center justify-center gap-2 h-11 rounded-xl text-[13.5px] font-medium transition-all border
          ${canPreview && !isProcessing
            ? previewPlaying
              ? 'bg-brand-cyan/15 border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/20'
              : 'bg-ink-700 border-line2/40 text-fg hover:border-brand-cyan/40 hover:text-brand-cyan'
            : 'bg-ink-800 border-line2/20 text-fg-dim opacity-40 cursor-not-allowed'
          }`}
        title="미리듣기"
      >
        <Icon name={previewPlaying ? 'pause' : 'play'} className="w-4 h-4" />
        <span>{previewPlaying ? '정지' : '미리듣기'}</span>
      </button>

      {/* Run amplify */}
      <button
        onClick={onRun}
        disabled={!canRun || isProcessing}
        className={`flex items-center justify-center gap-2 h-11 rounded-xl text-[13.5px] font-semibold transition-all border
          ${canRun && !isProcessing
            ? 'bg-brand-cyan text-ink-850 border-transparent hover:bg-cyan-300 shadow-md shadow-brand-cyan/20'
            : 'bg-ink-700 border-line2/30 text-fg-dim opacity-40 cursor-not-allowed'
          }`}
      >
        {isProcessing ? (
          <>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-ink-600 border-t-white animate-spin" />
            <span>처리 중...</span>
          </>
        ) : (
          <>
            <Icon name="sparkle" className="w-4 h-4" />
            <span>음량 변환</span>
          </>
        )}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        disabled={pageStatus === 'empty' || isProcessing}
        className={`flex items-center justify-center gap-2 h-11 rounded-xl text-[13.5px] font-medium transition-all border
          ${pageStatus !== 'empty' && !isProcessing
            ? 'bg-ink-700 border-line2/40 text-fg-dim hover:border-err/40 hover:text-err'
            : 'bg-ink-800 border-line2/20 text-fg-dim opacity-40 cursor-not-allowed'
          }`}
      >
        <Icon name="trash" className="w-4 h-4" />
        <span>초기화</span>
      </button>
    </div>
  )
}
