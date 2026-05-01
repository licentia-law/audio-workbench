/**
 * PredictedResultCard
 * 원본 Key → 변환 후 예상 Key 실시간 표시.
 * semi === 0 이면 "변환 없음" 표시.
 */
import { Icon } from '../icons/Icon'
import type { UploadStatus } from '../../types'

interface PredictedResultCardProps {
  pageStatus: UploadStatus
  semi: number
  originalKeyDisplay: string          // 'A minor' | 'Unknown' | '--'
  predicted: { display: string } | null  // transposeKey 결과
  isKeyUnknown: boolean
}

/* originalKey 영역의 색상은 noFile / 그 외(text-fg-dim) 두 가지로 충분.
 * Unknown인 경우에도 텍스트 자체가 "Unknown"이라 색상으로 구분할 필요 없음. */

export function PredictedResultCard({
  pageStatus,
  semi,
  originalKeyDisplay,
  predicted,
  isKeyUnknown,
}: PredictedResultCardProps) {
  const noFile = pageStatus === 'empty'

  let predictedDisplay: string
  if (noFile) {
    predictedDisplay = '--'
  } else if (isKeyUnknown) {
    predictedDisplay = 'Unknown'
  } else if (semi === 0) {
    predictedDisplay = originalKeyDisplay
  } else {
    predictedDisplay = predicted?.display ?? '--'
  }

  return (
    <div className="rounded-2xl border border-line bg-ink-700 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Icon name="sparkle" className="w-4 h-4 text-brand-cyan" />
        <span className="text-[14px] font-semibold tracking-tight">예상 결과</span>
      </div>

      {/* Key flow: original → predicted */}
      <div className="grid items-center gap-3" style={{ gridTemplateColumns: '1fr 24px 1fr auto' }}>
        {/* Original key */}
        <div>
          <div className="text-[11px] text-fg-dim mb-1.5">원본 Key</div>
          <div className={`text-[20px] font-semibold tracking-tight leading-none ${
            noFile ? 'text-fg-faint' : 'text-fg-dim'
          }`}>
            {noFile ? '--' : originalKeyDisplay}
          </div>
        </div>

        {/* Arrow */}
        <Icon
          name="arrow-right"
          className={`w-5 h-5 ${noFile ? 'text-fg-faint' : 'text-fg-dim'}`}
        />

        {/* Predicted key */}
        <div>
          <div className="text-[11px] text-fg-dim mb-1.5">변환 후 예상 Key</div>
          <div className={`text-[20px] font-semibold tracking-tight leading-none ${
            noFile
              ? 'text-fg-faint'
              : isKeyUnknown
              ? 'text-warn'
              : semi === 0
              ? 'text-fg-dim'
              : 'text-brand-cyan'
          }`}>
            {predictedDisplay}
          </div>
        </div>

        {/* Tempo (always preserved) */}
        <div className="pl-4 border-l border-line2/40">
          <div className="text-[11px] text-fg-dim mb-1.5 flex items-center gap-1">
            템포 <Icon name="help" className="w-3 h-3" />
          </div>
          <div className={`text-[14px] font-medium ${noFile ? 'text-fg-faint' : 'text-ok'}`}>
            {noFile ? '--' : '유지'}
          </div>
        </div>
      </div>
    </div>
  )
}
