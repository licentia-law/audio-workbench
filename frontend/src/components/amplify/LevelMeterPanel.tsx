/**
 * LevelMeterPanel
 * 32-segment vertical LED meter displaying real-time preview level.
 * Color zones: green (0~60%), yellow (60~80%), red (80~100%).
 */
import { linToDb, dbToPct } from '../../lib/audio/dbfs'

interface LevelMeterProps {
  /** 0~1 linear peak amplitude from analyser */
  level: number
  /** dBFS value to show as numeric label (optional) */
  dbValue?: number | null
  label?: string
}

const SEGMENTS = 32

function segColor(segIdx: number): { active: string; inactive: string } {
  const pct = (segIdx + 1) / SEGMENTS
  if (pct > 0.8) return { active: '#EF4444', inactive: '#3A1A1A' }
  if (pct > 0.6) return { active: '#F59E0B', inactive: '#2A2010' }
  return { active: '#22D3EE', inactive: '#1A2A30' }
}

export function LevelMeterPanel({ level, dbValue, label = 'LEVEL' }: LevelMeterProps) {
  const db = linToDb(level)
  const filledPct = dbToPct(db)
  const filledCount = Math.round(filledPct * SEGMENTS)

  return (
    <div className="bg-ink-800 rounded-2xl border border-line2/40 p-4 flex flex-col items-center gap-3">
      <div className="text-[10px] font-semibold tracking-widest text-fg-dim uppercase">{label}</div>

      {/* Vertical bar */}
      <div className="flex flex-col-reverse gap-[2px] w-8">
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const { active, inactive } = segColor(i)
          const lit = i < filledCount
          return (
            <div
              key={i}
              className="h-[4px] rounded-[1px] transition-colors duration-75"
              style={{ backgroundColor: lit ? active : inactive }}
            />
          )
        })}
      </div>

      {/* dB label */}
      <div className="text-[11px] tabular-nums text-fg-dim min-w-[40px] text-center">
        {dbValue != null && isFinite(dbValue)
          ? `${dbValue >= 0 ? '+' : ''}${dbValue.toFixed(1)}`
          : isFinite(db)
          ? `${db >= 0 ? '+' : ''}${db.toFixed(1)}`
          : '—'}
        <span className="text-[9px] ml-0.5">dB</span>
      </div>
    </div>
  )
}
