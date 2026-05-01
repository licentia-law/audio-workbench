import type { UploadStatus, AnalysisStep } from '../../types'
import { Icon } from '../icons/Icon'

interface StepListCardProps {
  state: UploadStatus
  steps: AnalysisStep[]
}

function StepRow({ label, status, progress }: AnalysisStep) {
  const iconName =
    status === 'done'   ? 'circle-check' :
    status === 'active' ? 'analyze' :
    status === 'error'  ? 'error' : 'info'

  const iconColor =
    status === 'done'   ? 'text-ok' :
    status === 'active' ? 'text-brand-cyan' :
    status === 'error'  ? 'text-err' : 'text-fg-mute'

  const labelColor = status === 'idle' ? 'text-fg-mute' : 'text-fg-dim'

  const barColor =
    status === 'done'   ? 'bg-ok' :
    status === 'error'  ? 'bg-err' : 'bg-brand-cyan'

  const pct = Math.round((progress ?? 0) * 100)

  return (
    <div className="flex items-center gap-3 py-2">
      <Icon name={iconName} className={`w-4 h-4 shrink-0 ${iconColor}`} />
      <div className={`text-[13px] flex-1 ${labelColor}`}>{label}</div>
      <div
        className="w-40 h-1.5 bg-ink-500 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full ${barColor} ${status === 'active' ? 'animate-pulse' : ''} transition-all duration-200`}
          style={{ width: `${status === 'done' ? 100 : pct}%` }}
        />
      </div>
      <div className="w-10 font-mono text-[11.5px] text-fg-mute text-right">
        {status === 'done' ? '100%' : `${pct}%`}
      </div>
    </div>
  )
}

export function StepListCard({ state, steps }: StepListCardProps) {
  const doneCount = steps.filter((s) => s.status === 'done').length
  const failed = state === 'error'
  const ready = state === 'success'

  const subText = ready
    ? `${doneCount} / ${steps.length} 단계 완료`
    : failed
      ? '중단됨'
      : state === 'processing'
        ? '진행 중'
        : '대기'

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-ink-800 border border-line2/50 grid place-items-center text-fg-dim">
            <Icon name="list" className="w-4 h-4" />
          </div>
          <div className="text-[14px] font-semibold tracking-tight">분석 진행</div>
        </div>
        <div className="font-mono text-[11.5px] text-fg-mute">{subText}</div>
      </div>

      <div className="divide-y divide-line2/30">
        {steps.map((s) => (
          <StepRow key={s.key} label={s.label} status={s.status} progress={s.progress} />
        ))}
      </div>
    </div>
  )
}
