import { Icon } from '../icons/Icon'

export function NoticeCard() {
  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5 min-h-[220px] flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-ink-800 border border-line2/50 grid place-items-center text-brand-cyan">
          <Icon name="info" className="w-4 h-4" />
        </div>
        <div className="text-[14px] font-semibold tracking-tight">안내</div>
      </div>

      <div className="text-[13px] text-fg-dim leading-relaxed">
        분석 결과는 참고용 추정값이며<br />실제 조성과 다를 수 있습니다.
      </div>

      <div className="mt-auto pt-3">
        <svg viewBox="0 0 280 60" className="w-full h-12 opacity-60">
          <defs>
            <linearGradient id="noticeWaveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#5EE6D6" stopOpacity="0.15" />
              <stop offset="0.5" stopColor="#5EE6D6" stopOpacity="0.65" />
              <stop offset="1" stopColor="#5EE6D6" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path
            d="M0 30 Q 35 5, 70 30 T 140 30 T 210 30 T 280 30"
            fill="none"
            stroke="url(#noticeWaveGrad)"
            strokeWidth="1.5"
          />
          <path
            d="M0 35 Q 35 15, 70 35 T 140 35 T 210 35 T 280 35"
            fill="none"
            stroke="url(#noticeWaveGrad)"
            strokeWidth="1"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>
  )
}
