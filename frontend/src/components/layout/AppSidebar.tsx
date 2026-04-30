import { NavLink } from 'react-router-dom'
import { Icon } from '../icons/Icon'

const NAV_ITEMS = [
  { to: '/cut', label: '음원 자르기', icon: 'scissors' as const },
  { to: '/analyze', label: '음원 분석', icon: 'analyze' as const },
  { to: '/keyshift', label: 'Key 변환', icon: 'key' as const },
  { to: '/amplify', label: '음량 증폭', icon: 'volume' as const },
  { to: '/stemmix', label: '스템 분리 / 믹스', icon: 'stems' as const },
]

export function AppSidebar() {
  return (
    <aside className="w-[220px] shrink-0 border-r border-line bg-ink-850 flex flex-col">
      <div className="px-5 pt-6 pb-7 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-brand-cyan/15 border border-brand-cyan/30 grid place-items-center text-brand-cyan">
          <Icon name="logo" className="w-4 h-4" />
        </div>
        <div className="font-semibold tracking-tight text-fg">Audio Adjuster</div>
      </div>

      <nav className="px-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 h-10 rounded-md text-[13.5px] transition-colors ${
                isActive
                  ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20'
                  : 'text-fg-dim hover:text-fg hover:bg-ink-700/60 border border-transparent'
              }`
            }
          >
            <Icon name={icon} className="w-4 h-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3 pb-5 flex flex-col gap-0.5">
        <a className="flex items-center gap-3 px-3 h-9 rounded-md text-[13px] text-fg-mute hover:text-fg-dim cursor-pointer">
          <Icon name="info" className="w-4 h-4" />
          이용 가이드
        </a>
        <a className="flex items-center gap-3 px-3 h-9 rounded-md text-[13px] text-fg-mute hover:text-fg-dim cursor-pointer">
          <Icon name="cog" className="w-4 h-4" />
          설정
        </a>
        <a className="flex items-center gap-3 px-3 h-9 rounded-md text-[13px] text-fg-mute hover:text-fg-dim cursor-pointer">
          <Icon name="support" className="w-4 h-4" />
          문의하기
        </a>
        <div className="px-3 pt-3 text-[11px] text-fg-faint">© 2026 Audio Adjuster</div>
      </div>
    </aside>
  )
}
