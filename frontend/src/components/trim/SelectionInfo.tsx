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
  const length = Math.max(0, end - start)
  const lengthOk = length >= 1.0
  const hasFile = total > 0

  const cells = [
    {
      label: '시작 시점',
      big: hasFile ? fmt(start) : '--:--',
      sub: '범위 0:00.00',
      color: 'text-brand-cyan',
    },
    {
      label: '종료 시점',
      big: hasFile ? fmt(end) : '--:--',
      sub: hasFile ? `범위 ${fmt(total)}` : '범위 --:--',
      color: 'text-brand-indigo',
    },
    {
      label: '선택 길이',
      big: hasFile ? fmt(length) : '--:--',
      sub: hasFile ? `(${length.toFixed(2)}초)` : '(0.00초)',
      color: !hasFile ? 'text-fg-mute' : lengthOk ? 'text-ok' : 'text-warn',
    },
  ]

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card grid grid-cols-3 divide-x divide-line2/40">
      {cells.map((c) => (
        <div key={c.label} className="px-7 py-5 flex flex-col items-center text-center">
          <div className="text-[12px] text-fg-mute mb-1.5">{c.label}</div>
          <div className={`font-mono text-[36px] font-semibold tracking-tight leading-none ${c.color}`}>
            {c.big}
          </div>
          <div className="text-[11.5px] text-fg-mute font-mono mt-2">{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
