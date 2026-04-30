import type { UploadStatus } from '../../types'

interface StatusBadgeProps {
  status: UploadStatus
}

const CONFIG: Record<UploadStatus, { label: string; className: string }> = {
  empty: { label: '대기 중', className: 'bg-gray-700 text-gray-300' },
  uploaded: { label: '업로드 완료', className: 'bg-blue-600 text-white' },
  processing: { label: '처리 중', className: 'bg-yellow-500 text-black' },
  success: { label: '완료', className: 'bg-green-600 text-white' },
  error: { label: '오류', className: 'bg-red-600 text-white' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
