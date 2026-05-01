import type { UploadStatus } from '../../types'
import { Icon } from '../icons/Icon'
import { Badge } from '../feedback/Badge'

interface LoudnessCardProps {
  state: UploadStatus
  peakDb?: number
  rmsDb?: number
  progress?: number
}

const SCALE_MIN = -60
const SCALE_MAX = 0

function dbToPct(db: number): number {
  return Math.max(0, Math.min(100, ((db - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100))
}

interface MeterProps {
  value: number
  label: string
  hint: string
  ready: boolean
  processing: boolean
  progress: number
}

function Meter({ value, label, hint, ready, processing, progress }: MeterProps) {
  return (
    <div className="rounded-xl bg-ink-800 border border-line2/50 px-4 py-3">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[11.5px] text-fg-mute">{label}</div>
        <div className={`font-mono text-[22px] font-semibold tracking-tight ${ready ? 'text-fg' : 'text-fg-faint'}`}>
          {ready ? `${value.toFixed(1)} dB` : '— —'}
        </div>
      </div>

      {/* Meter scale */}
      <div className="relative h-2 rounded-full bg-ink-500/80 overflow-hidden">
        {/* 배경 그라데이션: green → amber → red */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(63,207,142,0.25) 0%, rgba(242,181,68,0.35) 70%, rgba(244,110,122,0.5) 92%, rgba(244,110,122,0.85) 100%)',
          }}
        />
        {ready && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-brand-cyan/70 rounded-full transition-all duration-500"
            style={{ width: `${dbToPct(value)}%` }}
          />
        )}
        {processing && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-brand-cyan/40 animate-pulse rounded-full"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        )}
      </div>

      <div className="flex justify-between font-mono text-[10.5px] text-fg-faint mt-1.5">
        <span>-60</span>
        <span>-30</span>
        <span>0 dB</span>
      </div>
      <div className="text-[11px] text-fg-mute mt-2">{hint}</div>
    </div>
  )
}

export function LoudnessCard({ state, peakDb = 0, rmsDb = 0, progress = 0 }: LoudnessCardProps) {
  const ready = state === 'success'
  const processing = state === 'processing'

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-ink-800 border border-line2/50 grid place-items-center text-fg-dim">
            <Icon name="gauge" className="w-4 h-4" />
          </div>
          <div className="text-[14px] font-semibold tracking-tight">음량 (dBFS)</div>
          {ready && <Badge tone="ok"><Icon name="check" className="w-3 h-3" />분석 완료</Badge>}
          {processing && <Badge tone="cyan">분석 중…</Badge>}
          {state === 'error' && <Badge tone="err">실패</Badge>}
          {(state === 'empty' || state === 'uploaded') && <Badge tone="mute">대기</Badge>}
        </div>
        <div className="text-[11.5px] text-fg-mute">참고: 0 dBFS = 디지털 풀스케일</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Meter
          label="Peak"
          value={peakDb}
          hint="구간 최대"
          ready={ready}
          processing={processing}
          progress={progress}
        />
        <Meter
          label="RMS Avg"
          value={rmsDb}
          hint="평균 음량"
          ready={ready}
          processing={processing}
          progress={progress}
        />
      </div>
    </div>
  )
}
