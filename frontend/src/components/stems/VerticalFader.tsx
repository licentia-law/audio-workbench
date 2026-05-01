/**
 * VerticalFader
 * -24 ~ +12 dB 드래그 가능한 세로 페이더.
 * 0 dB 눈금 표시. 우측에 dB 스케일 + peak 미터.
 * role="slider" + aria 속성으로 키보드 접근성 지원.
 */
import { useRef } from 'react'

const MIN_DB = -24
const MAX_DB = 12
const ZERO_RATIO = (0 - MIN_DB) / (MAX_DB - MIN_DB)   // ≈ 0.667

interface VerticalFaderProps {
  value: number       // gainDb
  onChange: (db: number) => void
  color: string
  muted: boolean
  playing?: boolean
  disabled?: boolean
}

export function VerticalFader({
  value,
  onChange,
  color,
  muted,
  playing = false,
  disabled = false,
}: VerticalFaderProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const ratio  = (value - MIN_DB) / (MAX_DB - MIN_DB)  // 0(bottom)~1(top)
  // meter: 페이더 위치 기반 시각화
  const meterPct = muted ? 0 : Math.max(0.08, Math.min(1, ratio * 0.95 + (playing ? 0.05 : 0)))

  function startDrag(e: React.MouseEvent) {
    if (disabled) return
    e.preventDefault()
    const rect = trackRef.current!.getBoundingClientRect()

    function move(ev: MouseEvent) {
      const y = Math.max(0, Math.min(rect.height, ev.clientY - rect.top))
      const r = 1 - y / rect.height
      const db = MIN_DB + r * (MAX_DB - MIN_DB)
      onChange(Math.round(db * 10) / 10)  // 0.1 dB 단위
    }
    function up() {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    move(e.nativeEvent)
  }

  const dbLabel = value <= MIN_DB + 0.1 ? '-∞' : `${value >= 0 ? '+' : ''}${value.toFixed(1)} dB`

  return (
    <div className="flex items-stretch gap-3 h-[180px]" aria-disabled={disabled}>
      {/* 트랙 + 노브 */}
      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={MIN_DB}
        aria-valuemax={MAX_DB}
        aria-valuenow={value}
        aria-valuetext={dbLabel}
        tabIndex={disabled ? -1 : 0}
        className={`relative w-9 select-none ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        onMouseDown={startDrag}
        onKeyDown={e => {
          if (disabled) return
          if (e.key === 'ArrowUp')   onChange(Math.min(value + 0.1, MAX_DB))
          if (e.key === 'ArrowDown') onChange(Math.max(value - 0.1, MIN_DB))
        }}
      >
        {/* 트랙 배경 */}
        <div className="absolute inset-x-[14px] inset-y-1 rounded-full bg-ink-800 border border-line2/50" />

        {/* fill */}
        <div
          className="absolute inset-x-[14px] bottom-1 rounded-full"
          style={{
            height: `calc(${ratio * 100}% - 8px)`,
            background: muted
              ? 'linear-gradient(180deg,#4A5377,#2C3656)'
              : `linear-gradient(180deg,${color},${color}88)`,
            boxShadow: muted ? 'none' : `0 0 12px ${color}55`,
          }}
        />

        {/* 0 dB 눈금 */}
        <div
          className="absolute inset-x-[6px] h-px bg-fg-dim/40"
          style={{ top: `${(1 - ZERO_RATIO) * 100}%` }}
        />

        {/* 노브 */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-7 h-4 rounded-md border pointer-events-none"
          style={{
            top: `calc(${(1 - ratio) * 100}% - 8px)`,
            background: '#E6ECFF',
            borderColor: color,
            boxShadow: `0 0 0 1px ${color}66, 0 6px 12px -4px rgba(0,0,0,0.6)`,
          }}
        >
          <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-px bg-ink-700" />
        </div>
      </div>

      {/* 스케일 + 피크 미터 */}
      <div className="flex items-stretch gap-2 flex-1">
        {/* 스케일 */}
        <div className="flex flex-col justify-between text-[10px] font-mono text-fg-dim py-1">
          {['+12', '0', '-12', '-24'].map(t => <span key={t}>{t}</span>)}
        </div>

        {/* 피크 미터 */}
        <div className="relative w-3 self-stretch rounded-sm bg-ink-800 border border-line2/50 overflow-hidden">
          <div
            className="absolute inset-x-0 bottom-0 transition-[height] duration-[120ms] linear"
            style={{
              height: `${meterPct * 100}%`,
              background: `linear-gradient(180deg, ${
                meterPct > 0.85 ? '#F46E7A' : meterPct > 0.65 ? '#F2B544' : color
              } 0%, ${color}99 100%)`,
            }}
          />
          {[0.25, 0.5, 0.75].map((p, i) => (
            <div key={i} className="absolute inset-x-0 h-px bg-fg-faint/30" style={{ top: `${p * 100}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
