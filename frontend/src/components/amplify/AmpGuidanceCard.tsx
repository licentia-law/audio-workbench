/**
 * AmpGuidanceCard
 * Context-aware tips that change based on gain / clipping / anti-clip state.
 */
import { Icon } from '../icons/Icon'

interface AmpGuidanceCardProps {
  gainDb: number
  willClip: boolean
  antiClip: boolean
}

interface GuidanceItem {
  icon: 'info' | 'warn' | 'shield' | 'sparkle'
  tone: 'neutral' | 'warn' | 'ok' | 'cyan'
  text: string
}

function getItems(gainDb: number, willClip: boolean, antiClip: boolean): GuidanceItem[] {
  const items: GuidanceItem[] = []

  if (willClip && !antiClip) {
    items.push({
      icon: 'warn',
      tone: 'warn',
      text: '+12 dB 이상에서 클리핑이 발생할 수 있습니다. Anti-Clip을 켜거나 게인을 낮추세요.',
    })
  } else if (willClip && antiClip) {
    items.push({
      icon: 'shield',
      tone: 'ok',
      text: 'Anti-Clip 리미터가 활성화되어 클리핑을 자동으로 억제합니다.',
    })
  } else if (gainDb > 6) {
    items.push({
      icon: 'sparkle',
      tone: 'cyan',
      text: '큰 게인을 적용할 때는 Anti-Clip을 켜두면 음질 보호에 도움이 됩니다.',
    })
  } else if (gainDb < -6) {
    items.push({
      icon: 'info',
      tone: 'neutral',
      text: '게인을 낮추면 조용한 환경에서도 음악을 편안하게 들을 수 있습니다.',
    })
  } else {
    items.push({
      icon: 'info',
      tone: 'neutral',
      text: '슬라이더로 게인을 조정하고 미리듣기로 확인한 뒤 음량 변환을 실행하세요.',
    })
  }

  items.push({
    icon: 'info',
    tone: 'neutral',
    text: '변환은 MP3 포맷으로 저장됩니다. 변환 후 원본 음질로 되돌릴 수 없습니다.',
  })

  return items
}

const toneStyle: Record<string, string> = {
  neutral: 'text-fg-dim',
  warn: 'text-warn',
  ok: 'text-ok',
  cyan: 'text-brand-cyan',
}

const iconStyle: Record<string, string> = {
  neutral: 'bg-ink-700 border-line2/30 text-fg-dim',
  warn: 'bg-warn/10 border-warn/25 text-warn',
  ok: 'bg-ok/10 border-ok/25 text-ok',
  cyan: 'bg-brand-cyan/10 border-brand-cyan/25 text-brand-cyan',
}

export function AmpGuidanceCard({ gainDb, willClip, antiClip }: AmpGuidanceCardProps) {
  const items = getItems(gainDb, willClip, antiClip)

  return (
    <div className="bg-ink-800 rounded-2xl border border-line2/40 p-5 space-y-3">
      <div className="text-[11.5px] font-semibold tracking-wider text-fg-dim uppercase">안내</div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className={`w-7 h-7 rounded-full border grid place-items-center shrink-0 ${iconStyle[item.tone]}`}>
            <Icon name={item.icon} className="w-3.5 h-3.5" />
          </div>
          <p className={`text-[12.5px] leading-relaxed pt-0.5 ${toneStyle[item.tone]}`}>{item.text}</p>
        </div>
      ))}
    </div>
  )
}
