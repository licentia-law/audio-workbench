/**
 * SemitoneControl
 * 반음 조절 카드: 큰 숫자 표시 + −/+ 스테퍼 + 슬라이더 트랙.
 * 범위: −12 ~ +12.
 */
import { useRef } from 'react'
import { Icon } from '../icons/Icon'
import { formatSemitone } from '../../utils/format'
import type { UploadStatus } from '../../types'

const MIN = -12
const MAX = 12
const TICKS = [-12, -9, -6, -3, 0, 3, 6, 9, 12]

interface SemitoneControlProps {
  pageStatus: UploadStatus
  semi: number
  onChange: (v: number) => void
}

export function SemitoneControl({ pageStatus, semi, onChange }: SemitoneControlProps) {
  const locked = pageStatus === 'empty' || pageStatus === 'processing'
  const trackRef = useRef<HTMLDivElement>(null)

  function dec() {
    if (!locked) onChange(Math.max(MIN, semi - 1))
  }
  function inc() {
    if (!locked) onChange(Math.min(MAX, semi + 1))
  }

  function startDrag(e: React.MouseEvent) {
    if (locked) return
    const rect = trackRef.current!.getBoundingClientRect()
    function set(clientX: number) {
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left))
      onChange(Math.round((x / rect.width) * (MAX - MIN) + MIN))
    }
    set(e.clientX)
    function onMove(ev: MouseEvent) { set(ev.clientX) }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const pct = ((semi - MIN) / (MAX - MIN)) * 100
  const zeroPct = ((0 - MIN) / (MAX - MIN)) * 100
  const posWidth = Math.abs(pct - zeroPct)
  const posLeft = pct >= zeroPct ? zeroPct : pct

  const valueText = formatSemitone(semi)

  return (
    <div className="rounded-2xl border border-line bg-ink-700 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Icon name="music" className="w-4 h-4 text-brand-cyan" />
        <span className="text-[14px] font-semibold tracking-tight">반음(Key) 조절</span>
        <Icon name="help" className="w-3.5 h-3.5 text-fg-dim" />
        <span className="ml-auto text-[11px] text-fg-dim tabular-nums">범위 −12 ~ +12 semitone</span>
      </div>

      {/* Big number */}
      <div className="flex items-baseline justify-center gap-3 py-4">
        <span className={`text-[64px] font-semibold tracking-tight leading-none tabular-nums ${
          locked
            ? 'text-fg-faint'
            : semi > 0
            ? 'text-brand-cyan'
            : semi < 0
            ? 'text-brand-indigo'
            : 'text-fg'
        }`}>
          {valueText}
        </span>
        <span className="text-[15px] text-fg-dim">semitone</span>
      </div>

      {/* −/value/+ stepper */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <button
          onClick={dec}
          disabled={locked || semi <= MIN}
          className="w-10 h-10 rounded-md border border-line2 text-fg-dim hover:text-fg hover:bg-ink-600 disabled:opacity-40 disabled:cursor-not-allowed grid place-items-center transition-colors"
        >
          <Icon name="minus" className="w-4 h-4" />
        </button>
        <div className="w-28 h-10 rounded-md border border-line2 bg-ink-800 grid place-items-center text-[16px] font-semibold tracking-tight tabular-nums">
          {valueText}
        </div>
        <button
          onClick={inc}
          disabled={locked || semi >= MAX}
          className="w-10 h-10 rounded-md border border-line2 text-fg-dim hover:text-fg hover:bg-ink-600 disabled:opacity-40 disabled:cursor-not-allowed grid place-items-center transition-colors"
        >
          <Icon name="plus" className="w-4 h-4" />
        </button>
      </div>

      {/* Tick labels + track */}
      <div className="relative px-1">
        {/* Tick labels */}
        <div className="flex justify-between mb-2 px-0.5">
          {TICKS.map(t => (
            <div
              key={t}
              className={`text-[11px] tabular-nums ${
                t === semi
                  ? 'text-brand-cyan font-semibold'
                  : t === 0
                  ? 'text-fg-dim'
                  : 'text-fg-faint'
              }`}
            >
              {t > 0 ? `+${t}` : t}
            </div>
          ))}
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          onMouseDown={startDrag}
          className={`relative h-2 rounded-full bg-ink-500 ${
            locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {/* Tick marks */}
          {TICKS.map(t => (
            <div
              key={t}
              className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-line2/70"
              style={{ left: `${((t - MIN) / (MAX - MIN)) * 100}%` }}
            />
          ))}
          {/* Zero reference line */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-[2px] h-3.5 bg-fg-dim/60"
            style={{ left: `${zeroPct}%` }}
          />
          {/* Progress fill (0 → current) */}
          {semi !== 0 && (
            <div
              className="absolute top-0 bottom-0 rounded-full"
              style={{
                left: `${posLeft}%`,
                width: `${posWidth}%`,
                background: semi > 0
                  ? 'linear-gradient(90deg, rgba(94,230,214,0.5), rgba(94,230,214,0.95))'
                  : 'linear-gradient(270deg, rgba(131,100,255,0.5), rgba(131,100,255,0.9))',
              }}
            />
          )}
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-fg shadow-md ring-2 ring-brand-cyan pointer-events-none"
            style={{ left: `${pct}%` }}
          />
        </div>

        {/* Direction labels */}
        <div className="flex justify-between mt-2 text-[11px] text-fg-faint">
          <span>낮아짐</span>
          <span>원본</span>
          <span>높아짐</span>
        </div>
      </div>
    </div>
  )
}
