import type { ReactNode } from 'react'
import { FileUploadCard } from '../upload/FileUploadCard'
import { FileMetaCard } from '../result/FileMetaCard'
import { PrimaryPlayer } from '../player/PrimaryPlayer'
import { InfoMessageCard } from '../feedback/InfoMessageCard'
import { StatusBadge } from '../feedback/StatusBadge'
import { PageHeader } from './PageHeader'
import type { FileMeta, UploadStatus } from '../../types'

interface ProcessingPageShellProps {
  title: string
  description: string
  processLabel?: string
  processingLabel?: string
  successContent?: ReactNode
  // state from useProcessingPage
  pageStatus: UploadStatus
  uploadedFile: FileMeta | null
  peaks?: number[]
  errorMsg: string | null
  audioSrc?: string
  // handlers from useProcessingPage
  onUploadSuccess: (meta: FileMeta) => void
  onUploadError: (msg: string) => void
  onProcess: () => void
  onReset: () => void
}

export function ProcessingPageShell({
  title,
  description,
  processLabel = '처리 시작',
  processingLabel = '처리 중...',
  successContent,
  pageStatus,
  uploadedFile,
  peaks,
  errorMsg,
  audioSrc,
  onUploadSuccess,
  onUploadError,
  onProcess,
  onReset,
}: ProcessingPageShellProps) {
  const canProcess = pageStatus === 'uploaded' || pageStatus === 'success'
  const showReset = pageStatus === 'error' || pageStatus === 'success'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <PageHeader title={title} description={description} />
        <StatusBadge status={pageStatus} />
      </div>

      <div className="space-y-4 max-w-xl">
        <FileUploadCard onSuccess={onUploadSuccess} onError={onUploadError} />

        {uploadedFile && pageStatus !== 'empty' && (
          <>
            <FileMetaCard meta={uploadedFile} />
            <PrimaryPlayer src={audioSrc} peaks={peaks} />
          </>
        )}

        {pageStatus === 'processing' && (
          <div className="flex items-center justify-center gap-3 py-6 text-gray-400">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm">{processingLabel}</span>
          </div>
        )}

        {pageStatus === 'success' && successContent}

        {pageStatus === 'error' && errorMsg && (
          <InfoMessageCard type="error" message={errorMsg} />
        )}

        <div className="flex gap-2">
          <button
            onClick={onProcess}
            disabled={!canProcess}
            className={`
              px-5 py-2 rounded-lg text-sm font-medium transition-colors
              ${canProcess
                ? 'bg-accent hover:bg-accent/80 text-white cursor-pointer'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
              }
            `}
          >
            {processLabel}
          </button>

          {showReset && (
            <button
              onClick={onReset}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors cursor-pointer"
            >
              다시 업로드
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
