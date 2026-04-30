import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/cut', label: '음원 자르기', icon: '✂️' },
  { to: '/analyze', label: '음원 분석', icon: '📊' },
  { to: '/keyshift', label: 'Key 변환', icon: '🎵' },
  { to: '/amplify', label: '음량 증폭', icon: '🔊' },
  { to: '/stemmix', label: '스템 분리', icon: '🎚️' },
]

export function AppSidebar() {
  return (
    <aside className="w-56 flex-shrink-0 bg-surface-raised border-r border-white/10 flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="text-lg font-bold text-white tracking-tight">Audio Workbench</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
