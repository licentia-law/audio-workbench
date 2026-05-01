/**
 * GuidanceCard
 * 안내 및 팁 — 항상 표시. isKeyUnknown 일 때 추가 경고 표시.
 */
import { Icon } from '../icons/Icon'

interface GuidanceCardProps {
  isKeyUnknown: boolean
}

export function GuidanceCard({ isKeyUnknown }: GuidanceCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-ink-700 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="info" className="w-4 h-4 text-brand-indigo" />
        <span className="text-[14px] font-semibold tracking-tight">안내 및 팁</span>
      </div>

      <div className="text-[13px] text-fg-dim leading-relaxed space-y-2">
        <p>Key가 정확히 감지되지 않았더라도 반음 단위 변환은 가능합니다.</p>
        <p>템포(BPM)는 변경되지 않고 원본 그대로 유지됩니다.</p>
        <p className="flex items-start gap-1.5">
          <Icon name="key" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-fg-dim" />
          <span>키보드: <kbd className="px-1.5 py-0.5 rounded bg-ink-800 border border-line2/60 text-[11px] text-fg">←/→</kbd> 반음 조절,
            {' '}<kbd className="px-1.5 py-0.5 rounded bg-ink-800 border border-line2/60 text-[11px] text-fg">0</kbd> 초기화,
            {' '}<kbd className="px-1.5 py-0.5 rounded bg-ink-800 border border-line2/60 text-[11px] text-fg">Enter</kbd> 변환</span>
        </p>
        {isKeyUnknown && (
          <p className="text-warn flex items-start gap-1.5 pt-1">
            <Icon name="warn" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              분석 신뢰도가 낮아 파일명에{' '}
              <span className="tabular-nums text-fg-dim">key_shift_+N</span>{' '}
              형식이 사용됩니다.
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
