function fmt(t: number): string {
  if (isNaN(t) || t < 0) return '--:--'
  const m = Math.floor(t / 60)
  const s = t - m * 60
  const ss = Math.floor(s).toString().padStart(2, '0')
  const ms = Math.floor((s - Math.floor(s)) * 100).toString().padStart(2, '0')
  return `${m}:${ss}.${ms}`
}

interface SelectionInfoProps {
  start: number
  end: number
  total: number
}

export function SelectionInfo({ start, end, total }: SelectionInfoProps) {
  const length = end - start
  const lengthOk = length >= 1.0
  const hasFile = total > 0

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="grid grid-cols-3 divide-x divide-line/60">
        {/* Start */}
        <div className="flex flex-col items-center gap-1 px-4">
          <span className="text-[11px] text-fg-mute uppercase tracking-wide">시작 시점</span>
          <span className="font-mono text-[36px] font-semibold leading-none text-brand-cyan">
            {hasFile ? fmt(start) : '--:--'}
          </span>
        </div>

        {/* End */}
        <div className="flex flex-col items-center gap-1 px-4">
          <span className="text-[11px] text-fg-mute uppercase tracking-wide">종료 시점</span>
          <span className="font-mono text-[36px] font-semibold leading-none text-brand-indigo">
            {hasFile ? fmt(end) : '--:--'}
          </span>
        </div>

        {/* Length */}
        <div className="flex flex-col items-center gap-1 px-4">
          <span className="text-[11px] text-fg-mute uppercase tracking-wide">선택 길이</span>
          <span
            className={`font-mono text-[36px] font-semibold leading-none ${
              !hasFile ? 'text-fg-mute' : lengthOk ? 'text-ok' : 'text-warn'
            }`}
          >
            {hasFile ? fmt(length) : '--:--'}
          </span>
        </div>
      </div>
    </div>
  )
}
