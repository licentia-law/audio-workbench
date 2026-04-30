import type { ReactNode } from 'react'

type Tone = 'ok' | 'warn' | 'err' | 'cyan' | 'mute' | 'indigo'

interface BadgeProps {
  tone?: Tone
  children: ReactNode
}

const TONE_CLASSES: Record<Tone, string> = {
  ok: 'bg-ok/12 text-ok border-ok/30',
  warn: 'bg-warn/12 text-warn border-warn/30',
  err: 'bg-err/12 text-err border-err/30',
  cyan: 'bg-brand-cyan/12 text-brand-cyan border-brand-cyan/30',
  indigo: 'bg-brand-indigo/12 text-brand-indigo border-brand-indigo/30',
  mute: 'bg-ink-600 text-fg-mute border-line2',
}

export function Badge({ tone = 'ok', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 h-[22px] rounded-md border text-[11.5px] font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}
