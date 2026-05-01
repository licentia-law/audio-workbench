import { Icon } from '../icons/Icon'
import type { IconName } from '../icons/Icon'

interface FootNoticeProps {
  tone: 'warn' | 'err' | 'ok'
  icon: IconName
  title: string
  body?: string
}

export function FootNotice({ tone, icon, title, body }: FootNoticeProps) {
  const skinMap = {
    err:  'bg-err/8 border-err/35 text-err',
    ok:   'bg-ok/8 border-ok/35 text-ok',
    warn: 'bg-warn/8 border-warn/35 text-warn',
  }

  return (
    <div className={`mt-5 rounded-2xl border ${skinMap[tone]} px-5 py-4 flex items-start gap-3.5`}>
      <div className="w-9 h-9 rounded-full bg-ink-800/60 border border-line2/40 grid place-items-center shrink-0">
        <Icon name={icon} className="w-4 h-4" />
      </div>
      <div className="leading-relaxed">
        <div className="text-[13.5px] font-medium">{title}</div>
        {body && <div className="text-[12.5px] text-fg-dim mt-0.5">{body}</div>}
      </div>
    </div>
  )
}
