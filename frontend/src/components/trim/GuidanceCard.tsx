import { Icon } from '../icons/Icon'

interface ValidationFlags {
  hasFile: boolean
  order: boolean
  minLen: boolean
}

interface GuidanceCardProps {
  validation: ValidationFlags
}

type Tone = 'ok' | 'warn' | 'err' | 'mute'

interface CheckItemProps {
  tone: Tone
  text: string
}

const ICON_MAP: Record<Tone, 'circle-check' | 'warn' | 'error' | 'info'> = {
  ok: 'circle-check',
  warn: 'warn',
  err: 'error',
  mute: 'info',
}

const ICON_COLOR: Record<Tone, string> = {
  ok: 'text-ok',
  warn: 'text-warn',
  err: 'text-err',
  mute: 'text-fg-mute',
}

const TEXT_COLOR: Record<Tone, string> = {
  ok: 'text-fg-dim',
  warn: 'text-warn',
  err: 'text-err',
  mute: 'text-fg-dim',
}

function CheckItem({ tone, text }: CheckItemProps) {
  return (
    <li className="flex items-start gap-2.5 text-[13px]">
      <Icon name={ICON_MAP[tone]} className={`w-4 h-4 mt-0.5 shrink-0 ${ICON_COLOR[tone]}`} />
      <span className={TEXT_COLOR[tone]}>{text}</span>
    </li>
  )
}

export function GuidanceCard({ validation }: GuidanceCardProps) {
  const { hasFile, order, minLen } = validation

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="info" className="w-4 h-4 text-fg-dim" />
        <span className="text-[14px] font-semibold tracking-tight text-fg">안내 및 주의사항</span>
      </div>

      <ul className="flex flex-col gap-2.5">
        <CheckItem
          tone={!hasFile ? 'mute' : order ? 'ok' : 'err'}
          text="시작 시점은 종료 시점보다 앞서야 합니다."
        />
        <CheckItem
          tone={!hasFile ? 'mute' : minLen ? 'ok' : 'warn'}
          text="너무 짧은 구간은 품질이 떨어질 수 있습니다."
        />
        <CheckItem tone="mute" text="권장 길이: 1초 이상" />
      </ul>
    </div>
  )
}
