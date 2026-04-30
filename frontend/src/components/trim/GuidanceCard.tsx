interface ValidationFlags {
  hasFile: boolean
  order: boolean
  minLen: boolean
}

interface GuidanceCardProps {
  validation: ValidationFlags
}

interface CheckItemProps {
  tone: 'ok' | 'warn' | 'err' | 'mute'
  text: string
}

function CheckItem({ tone, text }: CheckItemProps) {
  const iconMap = {
    ok: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 flex-shrink-0 text-ok">
        <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm3.03 4.97L7 10.5 4.97 8.47l1.06-1.06L7 8.38l3.97-3.97 1.06 1.06z" />
      </svg>
    ),
    warn: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 flex-shrink-0 text-warn">
        <path d="M8 1.5L1 14.5h14L8 1.5zm-.75 4h1.5v5h-1.5V5.5zm0 6h1.5v1.5h-1.5V11.5z" />
      </svg>
    ),
    err: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 flex-shrink-0 text-err">
        <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm-.75 3.5h1.5v5h-1.5V5zm0 6h1.5v1.5h-1.5V11z" />
      </svg>
    ),
    mute: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 flex-shrink-0 text-fg-mute">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3.5M8 11v.5" strokeLinecap="round" />
      </svg>
    ),
  }

  const textColor = {
    ok: 'text-fg-dim',
    warn: 'text-warn',
    err: 'text-err',
    mute: 'text-fg-mute',
  }

  return (
    <li className="flex items-start gap-2.5 text-[13px]">
      {iconMap[tone]}
      <span className={textColor[tone]}>{text}</span>
    </li>
  )
}

export function GuidanceCard({ validation }: GuidanceCardProps) {
  const { hasFile, order, minLen } = validation

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-fg-dim">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 5v3.5M8 11v.5" strokeLinecap="round" />
        </svg>
        <span className="text-[14px] font-semibold tracking-tight text-fg">안내 및 주의사항</span>
      </div>

      <ul className="flex flex-col gap-2.5">
        <CheckItem
          tone={!hasFile ? 'mute' : order ? 'ok' : 'err'}
          text="시작 시점은 종료 시점보다 앞서야 합니다."
        />
        <CheckItem
          tone={!hasFile ? 'mute' : minLen ? 'ok' : 'warn'}
          text="선택 구간이 너무 짧습니다. 1초 이상을 권장합니다."
        />
        <CheckItem
          tone="mute"
          text="권장 길이: 1초 이상 (짧을수록 품질이 저하될 수 있습니다)"
        />
      </ul>
    </div>
  )
}
