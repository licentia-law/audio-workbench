/**
 * StemNoticeCard
 * 상시 표시. error 상태 시 에러 배너로 전환.
 */
import { Icon } from '../icons/Icon'
import type { UploadStatus } from '../../types'

interface StemNoticeCardProps {
  pageStatus: UploadStatus
  errorMsg?: string | null
}

export function StemNoticeCard({ pageStatus, errorMsg }: StemNoticeCardProps) {
  const isErr = pageStatus === 'error'

  return (
    <div className={`rounded-2xl border px-5 py-4 flex items-start gap-3.5 ${
      isErr ? 'bg-err/8 border-err/35' : 'bg-ink-700 border-line'
    }`}>
      <div className="w-9 h-9 rounded-full bg-ink-800/60 border border-line2/40 grid place-items-center shrink-0">
        <Icon
          name={isErr ? 'error' : 'info'}
          className={`w-4 h-4 ${isErr ? 'text-err' : 'text-fg-dim'}`}
        />
      </div>
      <ul className="text-[12.5px] text-fg-dim leading-relaxed space-y-1.5 flex-1 list-none p-0 m-0">
        {isErr && (
          <li className="text-err font-medium text-[13px]">
            {errorMsg ?? '분리에 실패했습니다.'}
          </li>
        )}
        <li>스템 분리는 AI 기반 분석이며, 완벽한 분리가 보장되지 않습니다.</li>
        <li>분리 처리 중 다른 페이지로 이동해도 작업이 유지됩니다.</li>
        {isErr && (
          <li className="text-err">다른 mp3 파일로 다시 시도하거나 파일 길이를 줄여보세요.</li>
        )}
      </ul>
    </div>
  )
}
