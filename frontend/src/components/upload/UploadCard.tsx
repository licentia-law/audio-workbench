import { useState } from 'react'
import { useFileStore } from '../../stores/fileStore'
import { apiService } from '../../services/api'
import { Icon } from '../icons/Icon'
import { Badge } from '../feedback/Badge'
import { formatBytes, formatDuration, formatSampleRate, formatBitrate } from '../../utils/format'
import type { FileMeta, UploadStatus } from '../../types'

// ── UploadCard ────────────────────────────────────────────────────────────────
// CutPage, AnalyzePage 등에서 공유하는 파일 업로드 + 메타 표시 카드.
// inputId: 페이지별로 고유한 <input> id (클릭 연결용).

interface UploadCardProps {
  inputId: string
  uploadedFile: FileMeta | null
  pageStatus: UploadStatus
  errorMsg: string | null
  onUploadSuccess: (meta: FileMeta) => void
  onUploadError: (msg: string) => void
  onClear: () => void
}

const MAX_SIZE = 20 * 1024 * 1024
const MAX_DURATION = 900

async function checkDuration(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.src = URL.createObjectURL(file)
    audio.onloadedmetadata = () => { URL.revokeObjectURL(audio.src); resolve(audio.duration <= MAX_DURATION) }
    audio.onerror = () => resolve(true)
  })
}

export function UploadCard({
  inputId, uploadedFile, pageStatus, errorMsg, onUploadSuccess, onUploadError, onClear,
}: UploadCardProps) {
  const { setUploadedFile, reset: resetStore } = useFileStore()
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

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
      const meta = await apiService.upload(file)
      setUploadedFile(meta)
      onUploadSuccess(meta)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '업로드에 실패했습니다.'
      setLocalError(msg); onUploadError(msg)
    }
  }

  function handleClear() {
    setLocalError(null)
    resetStore()
    onClear()
  }

  const displayError = localError || (pageStatus === 'error' ? errorMsg : null)
  const uploaded = !!uploadedFile

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="grid" style={{ gridTemplateColumns: '380px 1fr' }}>
        {/* Drop zone */}
        <div
          className={`relative rounded-xl px-5 py-6 flex flex-col items-center justify-center text-center min-h-[140px] cursor-pointer transition-colors ${
            uploaded
              ? 'border border-line2 border-dashed'
              : isDragging
                ? 'border border-dashed border-brand-cyan bg-brand-cyan/10'
                : 'border border-dashed border-brand-cyan/40 bg-brand-cyan/5 hover:bg-brand-cyan/10'
          }`}
          onClick={() => document.getElementById(inputId)?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault(); setIsDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
        >
          <div className={`w-9 h-9 rounded-full grid place-items-center mb-2 ${uploaded ? 'bg-ink-600 text-fg-mute' : 'bg-brand-cyan/15 text-brand-cyan'}`}>
            <Icon name="upload" className="w-4 h-4" />
          </div>
          <div className="text-[13.5px] text-fg">오디오 파일을 드래그&드롭 하세요</div>
          <div className="text-[11.5px] text-fg-mute my-1">또는</div>
          <button
            type="button"
            className="px-3.5 h-8 rounded-md bg-brand-cyan text-ink-850 text-[12.5px] font-semibold hover:bg-brand-cyan/90 transition-colors"
            onClick={(e) => { e.stopPropagation(); document.getElementById(inputId)?.click() }}
          >
            파일 선택
          </button>
          <div className="text-[11px] text-fg-mute mt-2.5">지원 형식: MP3 · 최대 15분 · 20MB</div>
        </div>

        <input
          id={inputId}
          type="file"
          accept=".mp3,audio/mpeg"
          className="hidden"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = '' }}
        />

        {/* File meta */}
        <div className="pl-6 flex items-center">
          {!uploaded ? (
            <div className="w-full text-fg-mute text-[13px] flex items-center gap-2">
              <Icon name="info" className="w-4 h-4" />
              업로드된 파일이 없습니다.
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-12 rounded-md bg-gradient-to-b from-ink-500 to-ink-600 border border-line2 grid place-items-center">
                  <span className="text-[10px] text-brand-cyan font-mono font-semibold">MP3</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <div className="text-[16px] font-semibold tracking-tight truncate">
                      {uploadedFile.original_name}
                    </div>
                    <Badge tone="ok">
                      <Icon name="check" className="w-3 h-3" />
                      업로드 완료
                    </Badge>
                  </div>
                  <div className="text-[12px] text-fg-mute mt-0.5">방금 업로드됨</div>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={pageStatus === 'processing'}
                  className="w-9 h-9 grid place-items-center rounded-md border border-line2 text-fg-mute hover:text-err hover:border-err/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="파일 제거"
                >
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {([
                  ['길이', formatDuration(uploadedFile.duration_seconds)],
                  ['크기', formatBytes(uploadedFile.size_bytes)],
                  ['형식', 'MP3'],
                  ['샘플레이트', formatSampleRate(uploadedFile.sample_rate)],
                  ['비트레이트', formatBitrate(uploadedFile.bit_rate)],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-ink-800 border border-line2/50 px-3 py-2">
                    <div className="text-[11px] text-fg-mute">{k}</div>
                    <div className="text-[14px] font-medium font-mono mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {displayError && (
        <p className="mt-4 text-xs text-err bg-err/10 rounded-lg px-3 py-2">{displayError}</p>
      )}
    </div>
  )
}
