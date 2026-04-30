import { useRef, useState } from 'react'
import type { UploadStatus } from '../../types'
import type { TrimSelection } from '../../types'

function fmt(t: number, withMs = false): string {
  if (isNaN(t)) return '--:--'
  const m = Math.floor(t / 60)
  const s = t - m * 60
  const ss = Math.floor(s).toString().padStart(2, '0')
  if (!withMs) return `${m}:${ss}`
  const ms = Math.floor((s - Math.floor(s)) * 100).toString().padStart(2, '0')
  return `${m}:${ss}.${ms}`
}

interface WaveformCardProps {
  duration: number
  startSec: number
  endSec: number
  playSec: number
  peaks?: number[]
  state: UploadStatus
  onChange: (patch: Partial<TrimSelection>) => void
  onSeek: (t: number) => void
}

interface HandleProps {
  side: 'start' | 'end'
  xPct: number
  onMouseDown: (e: React.MouseEvent) => void
  label: string
  active: boolean
}

function Handle({ side, xPct, onMouseDown, label, active }: HandleProps) {
  const isStart = side === 'start'
  const lineColor = isStart ? 'bg-brand-cyan/80' : 'bg-brand-indigo/80'
  const gripBorder = isStart ? 'border-brand-cyan/70' : 'border-brand-indigo/70'
  const gripActiveBg = isStart ? 'bg-brand-cyan border-brand-cyan' : 'bg-brand-indigo border-brand-indigo'
  const labelStyle = isStart
    ? 'bg-brand-cyan/15 border-brand-cyan/50 text-brand-cyan'
    : 'bg-brand-indigo/15 border-brand-indigo/50 text-brand-indigo'

  return (
    <div
      className="absolute top-0 bottom-0 cursor-ew-resize select-none"
      style={{ left: `${xPct}%` }}
      onMouseDown={onMouseDown}
    >
      <div className={`absolute inset-y-0 -left-px w-[2px] ${lineColor}`} />
      <div
        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-14 rounded-full border flex items-center justify-center ${
          active ? gripActiveBg : `bg-ink-700 ${gripBorder}`
        }`}
      >
        <div className="flex flex-col gap-0.5">
          <span className={`block w-1.5 h-px ${isStart ? 'bg-brand-cyan/80' : 'bg-brand-indigo/80'}`} />
          <span className={`block w-1.5 h-px ${isStart ? 'bg-brand-cyan/80' : 'bg-brand-indigo/80'}`} />
          <span className={`block w-1.5 h-px ${isStart ? 'bg-brand-cyan/80' : 'bg-brand-indigo/80'}`} />
        </div>
      </div>
      <div
        className={`absolute -top-7 -translate-x-1/2 left-0 px-1.5 py-0.5 rounded font-mono text-[11px] border ${labelStyle}`}
      >
        {label}
      </div>
    </div>
  )
}

export function WaveformCard({
  duration,
  startSec,
  endSec,
  playSec,
  peaks,
  state,
  onChange,
  onSeek,
}: WaveformCardProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<'start' | 'end' | 'play' | null>(null)

  const hasPeaks = peaks && peaks.length > 0
  const safeDuration = duration > 0 ? duration : 1

  const ticks: number[] = []
  for (let t = 0; t <= duration; t += 30) ticks.push(t)
  if (ticks.length === 0 || ticks[ticks.length - 1] !== duration) ticks.push(duration)

  function startDrag(which: 'start' | 'end' | 'play') {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      setDragging(which)
      const rect = innerRef.current!.getBoundingClientRect()

      function onMove(ev: MouseEvent) {
        const x = Math.max(0, Math.min(rect.width, ev.clientX - rect.left))
        const sec = (x / rect.width) * duration
        if (which === 'start') {
          onChange({ startSec: Math.min(sec, endSec - 0.5) })
        } else if (which === 'end') {
          onChange({ endSec: Math.max(sec, startSec + 0.5) })
        } else {
          onSeek(Math.max(0, Math.min(duration, sec)))
        }
      }

      function onUp() {
        setDragging(null)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }
  }

  const startPct = (startSec / safeDuration) * 100
  const endPct = (endSec / safeDuration) * 100
  const playPct = (playSec / safeDuration) * 100

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card">
      {/* Ruler */}
      <div className="h-7 px-4 pt-2 border-b border-line/40">
        <div ref={innerRef} className="relative h-5">
          {duration > 0 && ticks.map((t) => (
            <div
              key={t}
              className="absolute top-0 -translate-x-1/2 font-mono text-[11px] text-fg-mute select-none"
              style={{ left: `${(t / safeDuration) * 100}%` }}
            >
              {fmt(t)}
            </div>
          ))}
        </div>
      </div>

      {/* Waveform area */}
      <div className="relative px-4 pt-2 pb-8" style={{ height: 228 }}>
        <div className="relative h-full w-full">
          {hasPeaks && (
            <svg
              viewBox={`0 0 ${peaks.length} 100`}
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
            >
              <defs>
                <linearGradient id="wfDim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3A4670" />
                  <stop offset="1" stopColor="#222B47" />
                </linearGradient>
                <linearGradient id="wfHot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#7CF0E0" />
                  <stop offset="1" stopColor="#2DBEAE" />
                </linearGradient>
                <clipPath id="selClip">
                  <rect
                    x={(startSec / safeDuration) * peaks.length}
                    y="0"
                    width={((endSec - startSec) / safeDuration) * peaks.length}
                    height="100"
                  />
                </clipPath>
              </defs>
              <g fill="url(#wfDim)">
                {peaks.map((v, i) => (
                  <rect key={i} x={i + 0.15} y={50 - v * 46} width={0.7} height={v * 92} rx="0.3" />
                ))}
              </g>
              <g fill="url(#wfHot)" clipPath="url(#selClip)">
                {peaks.map((v, i) => (
                  <rect key={i} x={i + 0.15} y={50 - v * 46} width={0.7} height={v * 92} rx="0.3" />
                ))}
              </g>
              <line
                x1="0" y1="50" x2={peaks.length} y2="50"
                stroke="rgba(255,255,255,0.06)" strokeWidth="0.4"
              />
            </svg>
          )}

          {/* Empty placeholder */}
          {!hasPeaks && (
            <div className="absolute inset-0 flex items-center justify-center rounded">
              <div
                className="absolute inset-0 rounded opacity-20"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.08) 3px, rgba(255,255,255,0.08) 6px)',
                }}
              />
              <span className="relative text-fg-mute text-sm select-none">
                파일을 업로드하면 파형이 표시됩니다
              </span>
            </div>
          )}

          {/* Processing overlay */}
          {state === 'processing' && (
            <div className="absolute inset-0 bg-ink-850/60 flex items-center justify-center rounded">
              <div className="flex flex-col items-center gap-3">
                <div className="h-1 w-64 bg-ink-500 rounded overflow-hidden">
                  <div className="h-full bg-brand-cyan animate-pulse" style={{ width: '60%' }} />
                </div>
                <div className="text-fg-dim text-sm font-mono">자르는 중…</div>
              </div>
            </div>
          )}

          {/* Selection overlay tint */}
          {hasPeaks && duration > 0 && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: `${startPct}%`,
                width: `${endPct - startPct}%`,
                background: 'linear-gradient(180deg, rgba(94,230,214,0.10), rgba(94,230,214,0.02))',
                borderTop: '1px dashed rgba(94,230,214,0.45)',
                borderBottom: '1px dashed rgba(94,230,214,0.45)',
              }}
            />
          )}

          {/* Handles */}
          {hasPeaks && duration > 0 && (
            <>
              <Handle
                side="start"
                xPct={startPct}
                onMouseDown={startDrag('start')}
                label={fmt(startSec, true)}
                active={dragging === 'start'}
              />
              <Handle
                side="end"
                xPct={endPct}
                onMouseDown={startDrag('end')}
                label={fmt(endSec, true)}
                active={dragging === 'end'}
              />
            </>
          )}

          {/* Playhead */}
          {hasPeaks && duration > 0 && (
            <div
              className="absolute top-0 bottom-0 cursor-ew-resize select-none"
              style={{ left: `${playPct}%`, width: 1 }}
              onMouseDown={startDrag('play')}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-play" />
              <div className="absolute inset-y-0 -left-px w-[2px] bg-play" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-play/15 border border-play/40 text-play font-mono text-[11px] whitespace-nowrap">
                {fmt(playSec, true)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar (stub) */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-t border-line/40">
        <button className="w-8 h-8 grid place-items-center rounded-md border border-line/60 text-fg-mute hover:text-fg hover:bg-ink-600 text-xs">
          −
        </button>
        <button className="w-8 h-8 grid place-items-center rounded-md border border-line/60 text-fg-mute hover:text-fg hover:bg-ink-600 text-xs">
          +
        </button>
        <span className="ml-2 text-[11px] text-fg-mute font-mono">zoom 1.0×</span>
      </div>
    </div>
  )
}
