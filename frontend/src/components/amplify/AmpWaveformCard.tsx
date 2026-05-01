/**
 * AmpWaveformCard
 * Dual-layer SVG waveform:
 *   dim layer  — original waveform (dark blue, opacity 0.45)
 *   hot layer  — amplified waveform (cyan→indigo gradient, red if clipping)
 * willClip prop은 부모(AmplifyPage)에서 실제 peak 기반으로 계산해 전달.
 */
import { useMemo } from 'react'
import { formatGainDb } from '../../utils/format'

interface AmpWaveformCardProps {
  peaks: number[]        // 0~1 normalized peaks
  gainDb: number
  durationSec?: number
  willClip?: boolean     // 부모에서 정확한 peak 기반으로 계산한 클리핑 여부
}

const SVG_W = 600
const SVG_H = 80

function peaksToPath(
  peaks: number[],
  ampScale: number,
  width: number,
  height: number,
): string {
  if (peaks.length === 0) return ''
  const half = height / 2
  const step = width / peaks.length
  const pts: string[] = []
  for (let i = 0; i < peaks.length; i++) {
    const x = i * step + step / 2
    const h = Math.min(1, peaks[i] * ampScale) * half
    pts.push(`M${x.toFixed(1)},${(half - h).toFixed(1)}L${x.toFixed(1)},${(half + h).toFixed(1)}`)
  }
  return pts.join(' ')
}

export function AmpWaveformCard({ peaks, gainDb, durationSec, willClip = false }: AmpWaveformCardProps) {
  const ampScale = Math.min(2.2, Math.pow(10, gainDb / 20))

  const dimPath = useMemo(
    () => peaksToPath(peaks, 1, SVG_W, SVG_H),
    [peaks],
  )
  const hotPath = useMemo(
    () => peaksToPath(peaks, ampScale, SVG_W, SVG_H),
    [peaks, ampScale],
  )

  const hotStroke = willClip ? '#EF4444' : 'url(#hotGrad)'

  return (
    <div className="bg-ink-800 rounded-2xl border border-line2/40 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-line2/30">
        <span className="text-[12px] font-medium text-fg-dim">파형 미리보기</span>
        <div className="flex items-center gap-2">
          {willClip && (
            <span className="text-[11px] font-medium text-red-400 bg-red-500/10 border border-red-500/25 rounded-full px-2 py-0.5">
              클리핑 감지
            </span>
          )}
          {durationSec != null && (
            <span className="text-[11px] text-fg-dim">
              {Math.floor(durationSec / 60)}:{String(Math.floor(durationSec % 60)).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* SVG waveform */}
      <div className="px-4 py-3">
        {peaks.length === 0 ? (
          <div className="h-20 flex items-center justify-center">
            <div className="text-[12px] text-fg-dim">파일을 업로드하면 파형이 표시됩니다</div>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full"
            style={{ height: SVG_H }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="hotGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
              <linearGradient id="dimGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3A4670" />
                <stop offset="100%" stopColor="#222B47" />
              </linearGradient>
            </defs>

            <line
              x1={0} y1={SVG_H / 2} x2={SVG_W} y2={SVG_H / 2}
              stroke="#2A3358" strokeWidth="0.5"
            />

            {/* Dim layer — original */}
            <path d={dimPath} stroke="url(#dimGrad)" strokeWidth="1" opacity="0.45" fill="none" />

            {/* Hot layer — amplified */}
            <path d={hotPath} stroke={hotStroke} strokeWidth="1.5" opacity="0.9" fill="none" />
          </svg>
        )}
      </div>

      {/* Gain badge */}
      {peaks.length > 0 && (
        <div className="px-4 pb-3 flex justify-end">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            willClip
              ? 'text-red-400 bg-red-500/8 border-red-500/25'
              : gainDb > 0
              ? 'text-brand-cyan bg-brand-cyan/8 border-brand-cyan/25'
              : gainDb < 0
              ? 'text-indigo-400 bg-indigo-500/8 border-indigo-500/25'
              : 'text-fg-dim bg-ink-700 border-line2/30'
          }`}>
            {formatGainDb(gainDb)}
          </span>
        </div>
      )}
    </div>
  )
}
