/**
 * StemUploadCard
 * 3-column 레이아웃: 드롭존(380px) | 파일 메타(1fr) | 액션(280px)
 * + 분리 진행 상태 바 (processing/success/error 시 하단 표시)
 */
import { useState } from 'react'
import { useFileStore } from '../../stores/fileStore'
import { apiService } from '../../services/api'
import { Icon } from '../icons/Icon'
import { Badge } from '../feedback/Badge'
import { formatBytes, formatDuration, formatSampleRate, formatBitrate } from '../../utils/format'
import type { FileMeta, UploadStatus } from '../../types'

interface StemUploadCardProps {
  pageStatus: UploadStatus
  progress: number          // 0~100 (분리 진행도)
  errorMsg: string | null
  onUploadSuccess: (meta: FileMeta) => void
  onUploadError: (msg: string) => void
  onSeparate: () => void
  onClear: () => void
}

const MAX_SIZE     = 20 * 1024 * 1024
const MAX_DURATION = 900

async function checkDuration(file: File): Promise<boolean> {
  return new Promise(resolve => {
    const audio = new Audio()
    audio.src = URL.createObjectURL(file)
    audio.onloadedmetadata = () => { URL.revokeObjectURL(audio.src); resolve(audio.duration <= MAX_DURATION) }
    audio.onerror = () => resolve(true)
  })
}

export function StemUploadCard({
  pageStatus,
  progress,
  errorMsg,
  onUploadSuccess,
  onUploadError,
  onSeparate,
  onClear,
}: StemUploadCardProps) {
  const { uploadedFile, setUploadedFile, reset: resetStore } = useFileStore()
  const [isDragging,  setIsDragging]  = useState(false)
  const [localError,  setLocalError]  = useState<string | null>(null)
  const [uploading,   setUploading]   = useState(false)

  const uploaded    = !!uploadedFile
  const processing  = pageStatus === 'processing'
  const success     = pageStatus === 'success'
  const isError     = pageStatus === 'error'
  const showProgress = processing || success || isError

  async function handleFile(file: File) {
    setLocalError(null)
    if (!file.name.toLowerCase().endsWith('.mp3')) {
      const msg = 'mp3 파일만 업로드할 수 있습니다.'
      setLocalError(msg); onUploadError(msg); return
    }
    if (file.size > MAX_SIZE) {
      const msg = '파일 크기는 20MB 이하여야 합니다.'
      setLocalError(msg); onUploadError(msg); return
    }
    if (!(await checkDuration(file))) {
      const msg = '파일 길이는 15분 이하여야 합니다.'
      setLocalError(msg); onUploadError(msg); return
    }
    try {
      setUploading(true)
      const meta = await apiService.upload(file)
      setUploadedFile(meta)
      onUploadSuccess(meta)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '업로드에 실패했습니다.'
      setLocalError(msg); onUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

  function handleClear() {
    setLocalError(null)
    resetStore()
    onClear()
  }

  const displayError = localError || (isError ? errorMsg : null)
  const separateBtnDisabled = !uploaded || processing || uploading
  const separateBtnLabel = processing ? '분리 중…' : success ? '다시 분리' : isError ? '재시도' : '스템 분리 실행'

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="grid items-stretch gap-0" style={{ gridTemplateColumns: '380px 1fr 280px' }}>

        {/* ── 드롭존 ── */}
        <div
          className={`relative rounded-xl px-5 py-6 flex flex-col items-center justify-center text-center min-h-[160px] cursor-pointer transition-colors ${
            uploaded
              ? 'border border-dashed border-line2'
              : isDragging
                ? 'border border-dashed border-brand-cyan bg-brand-cyan/10'
                : 'border border-dashed border-brand-cyan/40 bg-brand-cyan/5 hover:bg-brand-cyan/10'
          }`}
          onClick={() => document.getElementById('stem-file-input')?.click()}
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => {
            e.preventDefault(); setIsDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
        >
          <div className={`w-9 h-9 rounded-full grid place-items-center mb-2 ${
            uploaded ? 'bg-ink-600 text-fg-dim' : 'bg-brand-cyan/15 text-brand-cyan'
          }`}>
            <Icon name={uploading ? 'dots' : 'upload'} className="w-4 h-4" />
          </div>
          <div className="text-[13.5px] text-fg">오디오 파일을 드래그&드롭 하세요</div>
          <div className="text-[11.5px] text-fg-dim my-1">또는</div>
          <button
            type="button"
            className="px-3.5 h-8 rounded-md bg-brand-cyan text-ink-850 text-[12.5px] font-semibold hover:bg-brand-cyan/90 transition-colors"
            onClick={e => { e.stopPropagation(); document.getElementById('stem-file-input')?.click() }}
          >
            파일 선택
          </button>
          <div className="text-[11px] text-fg-dim mt-2.5">지원 형식: MP3 · 최대 15분 · 20MB</div>
        </div>
        <input
          id="stem-file-input"
          type="file"
          accept=".mp3,audio/mpeg"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        />

        {/* ── 파일 메타 ── */}
        <div className="pl-6 pr-4 flex items-center">
          {!uploaded ? (
            <div className="text-fg-dim text-[13px] flex items-center gap-2">
              <Icon name="info" className="w-4 h-4" />
              업로드된 파일이 없습니다.
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-12 rounded-md bg-gradient-to-b from-ink-500 to-ink-600 border border-line2 grid place-items-center shrink-0">
                  <span className="text-[10px] text-brand-cyan font-mono font-semibold">MP3</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-[15px] font-semibold tracking-tight truncate max-w-[220px]">
                      {uploadedFile.original_name}
                    </div>
                    {success  && <Badge tone="ok"><Icon name="check" className="w-3 h-3" />분리 완료</Badge>}
                    {processing && <Badge tone="cyan">분리 중…</Badge>}
                    {!processing && !success && !isError && <Badge tone="ok"><Icon name="check" className="w-3 h-3" />업로드 완료</Badge>}
                    {isError && <Badge tone="err">분리 실패</Badge>}
                  </div>
                  <div className="text-[12px] text-fg-dim mt-0.5">방금 업로드됨</div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {([
                  ['길이',      formatDuration(uploadedFile.duration_seconds)],
                  ['크기',      formatBytes(uploadedFile.size_bytes)],
                  ['형식',      'MP3'],
                  ['샘플레이트', formatSampleRate(uploadedFile.sample_rate)],
                  ['비트레이트', formatBitrate(uploadedFile.bit_rate)],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-ink-800 border border-line2/50 px-2.5 py-2">
                    <div className="text-[10.5px] text-fg-dim">{k}</div>
                    <div className="text-[13px] font-medium font-mono mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 액션 컬럼 ── */}
        <div className="flex flex-col items-stretch justify-center gap-2 border-l border-line2/40 pl-5">
          <button
            onClick={onSeparate}
            disabled={separateBtnDisabled}
            className={`h-12 px-4 rounded-lg inline-flex items-center justify-center gap-2 text-[13.5px] font-semibold border transition-colors ${
              separateBtnDisabled
                ? 'bg-ink-500 text-fg-dim border-line2 cursor-not-allowed'
                : 'bg-brand-cyan text-ink-850 border-brand-cyan hover:bg-brand-cyan/90'
            }`}
          >
            <Icon name={processing ? 'dots' : 'stems'} className={`w-4 h-4 ${processing ? 'animate-pulse' : ''}`} />
            {separateBtnLabel}
          </button>
          <button
            onClick={handleClear}
            disabled={!uploaded || processing}
            className="h-9 rounded-md border border-line2 text-fg-dim hover:text-err hover:border-err/50 inline-flex items-center justify-center gap-2 text-[12.5px] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="trash" className="w-3.5 h-3.5" />
            파일 제거
          </button>
        </div>
      </div>

      {/* ── 진행 상태 바 ── */}
      {showProgress && (
        <div className="mt-4 pt-4 border-t border-line2/40 flex items-center gap-4">
          <div className="text-[12px] text-fg-dim shrink-0 w-[88px]">분리 진행 상태</div>
          <div className="flex-1 h-2 bg-ink-500 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isError ? 'bg-err' : 'bg-brand-cyan'} ${processing ? 'animate-pulse' : ''}`}
              style={{ width: `${isError ? 32 : progress}%`, transition: 'width 0.6s ease-out' }}
            />
          </div>
          <div className="font-mono text-[12px] w-[52px] text-right text-fg-dim">
            {isError ? '오류' : `${Math.round(progress)}%`}
          </div>
          {success    && <Badge tone="ok"><Icon name="check" className="w-3 h-3" />분리 완료</Badge>}
          {processing && <span className="text-[11.5px] text-fg-dim whitespace-nowrap">예상 소요 1~2분 · Demucs 4-stem</span>}
          {isError    && <Badge tone="err">분리 실패</Badge>}
        </div>
      )}

      {displayError && (
        <p className="mt-3 text-[12px] text-err bg-err/10 rounded-lg px-3 py-2">{displayError}</p>
      )}
    </div>
  )
}
