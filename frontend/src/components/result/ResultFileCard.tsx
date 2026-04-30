import { DownloadButton } from './DownloadButton'

interface ResultFileCardProps {
  filename: string
  downloadUrl: string
  label?: string
}

export function ResultFileCard({ filename, downloadUrl, label }: ResultFileCardProps) {
  return (
    <div className="rounded-xl bg-surface-raised border border-white/10 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">처리 결과</h3>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 mb-0.5">{label ?? '결과 파일'}</p>
          <p className="text-sm text-white font-medium truncate">{filename}</p>
        </div>
        <DownloadButton url={downloadUrl} filename={filename} />
      </div>
    </div>
  )
}
