import type { FileMeta } from '../../types'
import { formatBytes, formatDuration } from '../../utils/format'

interface FileMetaCardProps {
  meta: FileMeta
}

export function FileMetaCard({ meta }: FileMetaCardProps) {
  return (
    <div className="rounded-xl bg-surface-raised border border-white/10 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">파일 정보</h3>
      <dl className="space-y-2">
        <div className="flex justify-between text-sm">
          <dt className="text-gray-400">파일명</dt>
          <dd className="text-white font-medium truncate max-w-[200px]">{meta.original_name}</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-gray-400">길이</dt>
          <dd className="text-white font-medium">{formatDuration(meta.duration_seconds)}</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-gray-400">용량</dt>
          <dd className="text-white font-medium">{formatBytes(meta.size_bytes)}</dd>
        </div>
      </dl>
    </div>
  )
}
