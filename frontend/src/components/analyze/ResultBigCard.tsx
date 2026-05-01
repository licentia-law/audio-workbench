import type { UploadStatus } from '../../types'
import { Icon } from '../icons/Icon'
import { Badge } from '../feedback/Badge'

interface ResultBigCardProps {
  icon: 'key' | 'metronome'
  title: string
  state: UploadStatus
  value: string          // "A minor" | "128" | "Unknown"
  unit?: string          // "BPM" 등 value 우측 작은 단위
  caption: string        // 하단 좌 "조성" | "템포"
  captionSub?: string    // 하단 우 "A 마이너" | "Beats Per Minute"
  progress?: number      // 0..1 (processing 시)
  unknown?: boolean
}

export function ResultBigCard({
  icon, title, state, value, unit, caption, captionSub, progress = 0, unknown = false,
}: ResultBigCardProps) {
  const isSuccess = state === 'success'
  const isProcessing = state === 'processing'
  const isError = state === 'error'

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5 min-h-[220px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-ink-800 border border-line2/50 grid place-items-center text-fg-dim">
            <Icon name={icon} className="w-4 h-4" />
          </div>
          <div className="text-[14px] font-semibold tracking-tight">{title}</div>
        </div>
        {isSuccess && (
          unknown
            ? <Badge tone="warn"><Icon name="warn" className="w-3 h-3" />Unknown</Badge>
            : <Badge tone="ok"><Icon name="check" className="w-3 h-3" />분석 완료</Badge>
        )}
        {isProcessing && <Badge tone="cyan">분석 중…</Badge>}
        {isError && <Badge tone="err"><Icon name="error" className="w-3 h-3" />실패</Badge>}
        {(state === 'empty' || state === 'uploaded') && <Badge tone="mute">대기</Badge>}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col justify-center">
        {isSuccess && (
          <div className="flex items-baseline gap-2" aria-live="polite">
            <div className={`font-mono font-semibold tracking-tight leading-none ${unknown ? 'text-[40px] text-warn' : 'text-[64px] text-brand-cyan'}`}>
              {value}
            </div>
            {unit && !unknown && (
              <div className="font-mono text-[15px] text-fg-mute mb-1.5">{unit}</div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="space-y-3 py-2">
            <div className="font-mono text-[40px] leading-none font-semibold tracking-tight text-fg-faint">— —</div>
            <div className="h-1.5 bg-ink-500 rounded overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress * 100)}>
              <div
                className="h-full bg-brand-cyan transition-all duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <div className="font-mono text-[11.5px] text-fg-mute">{Math.round(progress * 100)}% · 추정 중</div>
          </div>
        )}

        {(state === 'empty' || state === 'uploaded') && (
          <div className="font-mono text-[64px] leading-none font-semibold tracking-tight text-fg-faint">— —</div>
        )}

        {isError && (
          <div>
            <div className="font-mono text-[40px] leading-none font-semibold tracking-tight text-warn">Unknown</div>
            <div className="text-[12px] text-fg-mute mt-2">분석에 실패했습니다.</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between pt-3 border-t border-line2/40 mt-3">
        <div className="text-[12px] text-fg-mute">{caption}</div>
        {isSuccess && captionSub && (
          <div className="text-[12px] text-fg-dim font-mono">{captionSub}</div>
        )}
      </div>
    </div>
  )
}
