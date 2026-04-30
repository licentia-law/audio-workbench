interface DownloadButtonProps {
  url: string
  filename: string
  disabled?: boolean
  label?: string
}

export function DownloadButton({ url, filename, disabled = false, label = '다운로드' }: DownloadButtonProps) {
  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-white/30 cursor-not-allowed">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {label}
      </span>
    )
  }

  return (
    <a
      href={url}
      download={filename}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-accent hover:bg-accent/80 text-white transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
    </a>
  )
}
