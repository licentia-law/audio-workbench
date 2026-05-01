/**
 * GainSliderPanel
 * Horizontal range slider -20~+20 dB with zone coloring:
 *   left of center (gain < 0)  → indigo fill
 *   right of center (gain > 0) → cyan fill
 *   > +12 dB zone              → warn/amber fill
 * Big number display and Anti-clip toggle.
 */
import { formatGainDbNum } from '../../utils/format'

interface GainSliderPanelProps {
  gainDb: number
  antiClip: boolean
  onChange: (db: number) => void
  onAntiClipChange: (on: boolean) => void
}

const MIN = -20
const MAX = 20
const STEP = 0.5
const WARN_THRESHOLD = 12

function gainColor(db: number): string {
  if (db > WARN_THRESHOLD) return 'text-warn'
  if (db > 0) return 'text-brand-cyan'
  if (db < 0) return 'text-indigo-400'
  return 'text-fg-dim'
}

export function GainSliderPanel({
  gainDb,
  antiClip,
  onChange,
  onAntiClipChange,
}: GainSliderPanelProps) {
  const pct = ((gainDb - MIN) / (MAX - MIN)) * 100  // 0~100

  // Track fill: split at center (50%)
  const centerPct = 50
  let fillStyle: React.CSSProperties
  if (gainDb >= 0) {
    const isWarn = gainDb > WARN_THRESHOLD
    const fillColor = isWarn ? '#F59E0B' : '#22D3EE'
    fillStyle = {
      background: `linear-gradient(to right,
        transparent 0%, transparent ${centerPct}%,
        ${fillColor} ${centerPct}%, ${fillColor} ${pct}%,
        transparent ${pct}%, transparent 100%)`,
    }
  } else {
    fillStyle = {
      background: `linear-gradient(to right,
        transparent 0%, transparent ${pct}%,
        #818CF8 ${pct}%, #818CF8 ${centerPct}%,
        transparent ${centerPct}%, transparent 100%)`,
    }
  }

  return (
    <div className="bg-ink-800 rounded-2xl border border-line2/40 p-5 space-y-5">
      {/* Big number */}
      <div className="flex items-end gap-2">
        <span className={`text-[42px] font-bold leading-none tabular-nums ${gainColor(gainDb)}`}>
          {formatGainDbNum(gainDb)}
        </span>
        <span className="text-fg-dim text-sm mb-1.5">dB</span>
        {gainDb > WARN_THRESHOLD && (
          <span className="ml-auto text-xs font-medium text-warn bg-warn/10 border border-warn/30 rounded-full px-2.5 py-0.5">
            클리핑 주의
          </span>
        )}
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Custom track */}
        <div
          className="absolute inset-y-0 left-0 right-0 my-auto h-1.5 rounded-full bg-ink-700 border border-line2/30"
          style={fillStyle}
        />
        {/* Center notch */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-line2/60 rounded-full pointer-events-none"
          style={{ left: '50%' }}
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={gainDb}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="relative w-full h-5 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-brand-cyan/80
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110"
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between text-[11px] text-fg-dim px-0.5">
        <span>-20 dB</span>
        <span>0</span>
        <span>+20 dB</span>
      </div>

      {/* Anti-clip toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-line2/30">
        <div>
          <div className="text-[13px] font-medium text-fg flex items-center gap-1.5">
            <span>Anti-Clip</span>
          </div>
          <div className="text-[11.5px] text-fg-dim mt-0.5">피크 리미터로 클리핑 방지</div>
        </div>
        <button
          onClick={() => onAntiClipChange(!antiClip)}
          className={`w-10 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${
            antiClip ? 'bg-brand-cyan' : 'bg-ink-700 border border-line2/40'
          }`}
          aria-pressed={antiClip}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
              antiClip ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
