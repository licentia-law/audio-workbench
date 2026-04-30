import { useRef } from 'react'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'

interface PrimaryPlayerProps {
  src?: string
  peaks?: number[]
  disabled?: boolean
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function PrimaryPlayer({ src, peaks, disabled = false }: PrimaryPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { isPlaying, currentTime, duration, isReady, togglePlay } = useAudioPlayer(
    containerRef,
    src,
    peaks
  )

  const isDisabled = disabled || !src || !isReady

  return (
    <div className="rounded-xl bg-surface-raised border border-white/10 p-4 space-y-3">
      <div className="overflow-hidden" style={{ height: 64 }}>
        {src ? (
          <div ref={containerRef} style={{ height: 64 }} />
        ) : (
          <div className="rounded bg-white/5 animate-pulse" style={{ height: 64 }} />
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={isDisabled}
          className={`
            flex items-center justify-center w-9 h-9 rounded-full transition-colors
            ${isDisabled
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-accent hover:bg-accent/80 text-white cursor-pointer'
            }
          `}
          aria-label={isPlaying ? '정지' : '재생'}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <span className="text-xs font-mono text-gray-400 tabular-nums">
          {formatTime(currentTime)}
          <span className="text-gray-600 mx-1">/</span>
          {formatTime(duration)}
        </span>

        {src && !isReady && (
          <span className="text-xs text-gray-500">로딩 중...</span>
        )}
      </div>
    </div>
  )
}
