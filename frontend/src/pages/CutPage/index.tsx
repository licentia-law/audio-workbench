import { useState, useCallback } from 'react'
import { useFileStore } from '../../stores/fileStore'
import { apiService } from '../../services/api'
import { useTrimSelection } from '../../hooks/useTrimSelection'
import { useTrimPlayback } from '../../hooks/useTrimPlayback'
import { WaveformCard } from '../../components/trim/WaveformCard'
import { SelectionInfo } from '../../components/trim/SelectionInfo'
import { ControlBar } from '../../components/trim/ControlBar'
import { ResultCard } from '../../components/trim/ResultCard'
import { GuidanceCard } from '../../components/trim/GuidanceCard'
import type { FileMeta, UploadStatus, CutResult } from '../../types'

// ── Upload section ──────────────────────────────────────────────────────────

interface UploadSectionProps {
  uploadedFile: FileMeta | null
  pageStatus: UploadStatus
  errorMsg: string | null
  onUploadSuccess: (meta: FileMeta) => void
  onUploadError: (msg: string) => void
}

function UploadSection({
  uploadedFile,
  pageStatus,
  errorMsg,
  onUploadSuccess,
  onUploadError,
}: UploadSectionProps) {
  const { setUploadedFile } = useFileStore()
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const MAX_SIZE = 20 * 1024 * 1024
  const MAX_DURATION = 600

  function formatBytes(b: number) {
    return b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(2)} MB`
  }

  function formatDuration(s: number) {
    const m = Math.floor(s / 60)
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  async function checkDuration(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src)
        resolve(audio.duration <= MAX_DURATION)
      }
      audio.onerror = () => resolve(true)
    })
  }

  async function handleFile(file: File) {
    setLocalError(null)

    if (!file.name.toLowerCase().endsWith('.mp3')) {
      const msg = 'mp3 파일만 업로드할 수 있습니다.'
      setLocalError(msg)
      onUploadError(msg)
      return
    }
    if (file.size > MAX_SIZE) {
      const msg = '파일 크기는 20MB 이하여야 합니다.'
      setLocalError(msg)
      onUploadError(msg)
      return
    }
    const ok = await checkDuration(file)
    if (!ok) {
      const msg = '파일 길이는 10분 이하여야 합니다.'
      setLocalError(msg)
      onUploadError(msg)
      return
    }

    try {
      const meta = await apiService.upload(file)
      setUploadedFile(meta)
      onUploadSuccess(meta)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '업로드에 실패했습니다.'
      setLocalError(msg)
      onUploadError(msg)
    }
  }

  const displayError = localError || (pageStatus === 'error' ? errorMsg : null)

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="flex gap-5">
        {/* Dropzone */}
        <div
          className={`w-[360px] flex-shrink-0 rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            isDragging
              ? 'border-brand-cyan bg-brand-cyan/5'
              : 'border-line/80 hover:border-brand-cyan/50'
          }`}
          onClick={() => document.getElementById('cut-file-input')?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-fg-mute">
            <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm text-fg-dim text-center">
            mp3 파일을 드래그하거나{' '}
            <span className="text-brand-cyan font-medium">클릭하여 선택</span>하세요
          </p>
          <p className="text-xs text-fg-mute">최대 20MB / 10분 이하</p>
        </div>

        <input
          id="cut-file-input"
          type="file"
          accept=".mp3,audio/mpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />

        {/* File meta */}
        <div className="flex-1 min-w-0">
          {uploadedFile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-md border text-[11.5px] font-medium bg-ok/12 text-ok border-ok/30">
                  ✓ 업로드 완료
                </span>
              </div>
              <dl className="space-y-2">
                {[
                  { label: '파일명', value: uploadedFile.original_name },
                  { label: '길이', value: formatDuration(uploadedFile.duration_seconds) },
                  { label: '용량', value: formatBytes(uploadedFile.size_bytes) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <dt className="text-fg-mute">{label}</dt>
                    <dd className="text-fg font-medium truncate max-w-[220px] text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div className="flex items-center h-full text-fg-mute text-sm">
              파일을 업로드하면 정보가 표시됩니다.
            </div>
          )}

          {displayError && (
            <p className="mt-3 text-xs text-err bg-err/10 rounded-lg px-3 py-2">{displayError}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── CutPage ─────────────────────────────────────────────────────────────────

export function CutPage() {
  const { uploadedFile } = useFileStore()
  const [pageStatus, setPageStatus] = useState<UploadStatus>('empty')
  const [peaks, setPeaks] = useState<number[] | undefined>()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [result, setResult] = useState<CutResult | null>(null)

  const audioSrc = uploadedFile ? `/api/file/${uploadedFile.file_id}/audio` : undefined

  const sel = useTrimSelection(uploadedFile?.duration_seconds ?? 0)
  const playback = useTrimPlayback(audioSrc)

  const validation = {
    hasFile: !!uploadedFile,
    order: sel.startSec < sel.endSec,
    minLen: sel.endSec - sel.startSec >= 1.0,
  }
  const canCut =
    validation.hasFile &&
    validation.order &&
    validation.minLen &&
    pageStatus !== 'processing'

  const handleUploadSuccess = useCallback(async (meta: FileMeta) => {
    setErrorMsg(null)
    setPeaks(undefined)
    setResult(null)
    setPageStatus('uploaded')
    try {
      const wf = await apiService.getWaveform(meta.file_id)
      setPeaks(wf.peaks)
    } catch {
      // peaks optional - waveform shows empty state
    }
  }, [])

  const handleUploadError = useCallback((msg: string) => {
    setErrorMsg(msg)
    setPageStatus('error')
  }, [])

  async function handleCut() {
    if (!uploadedFile) return
    if (pageStatus !== 'success' && pageStatus !== 'error' && !canCut) return

    playback.stop()
    setPageStatus('processing')
    setErrorMsg(null)

    try {
      const r = await apiService.cut(uploadedFile.file_id, {
        start_sec: sel.startSec,
        end_sec: sel.endSec,
      })
      setResult(r)
      setPageStatus('success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '자르기 처리에 실패했습니다.'
      setErrorMsg(msg)
      setPageStatus('error')
    }
  }

  return (
    <div className="space-y-5 max-w-[1220px]">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-fg tracking-tight">음원 자르기</h2>
        <p className="mt-1 text-sm text-fg-mute">원하는 구간만 선택하여 잘라낼 수 있습니다.</p>
      </div>

      {/* Upload + Meta */}
      <UploadSection
        uploadedFile={uploadedFile}
        pageStatus={pageStatus}
        errorMsg={errorMsg}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {/* Waveform */}
      <WaveformCard
        duration={uploadedFile?.duration_seconds ?? 0}
        startSec={sel.startSec}
        endSec={sel.endSec}
        playSec={playback.currentSec}
        peaks={peaks}
        state={pageStatus}
        onChange={sel.set}
        onSeek={playback.seek}
      />

      {/* Selection Info */}
      <SelectionInfo
        start={sel.startSec}
        end={sel.endSec}
        total={uploadedFile?.duration_seconds ?? 0}
      />

      {/* Control Bar */}
      <ControlBar
        state={pageStatus}
        canCut={canCut}
        isPlaying={playback.isPlaying}
        onPlay={() => playback.playFrom(sel.startSec)}
        onStop={playback.stop}
        onPreviewStart={() => playback.playFrom(sel.startSec)}
        onPreviewEnd={() =>
          playback.playFrom(
            Math.max(sel.startSec, sel.endSec - 5),
            sel.endSec,
          )
        }
        onCut={handleCut}
      />

      {/* Result + Guidance */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 380px' }}>
        <ResultCard
          state={pageStatus}
          result={result}
          errorMsg={errorMsg}
          onRetry={handleCut}
        />
        <GuidanceCard validation={validation} />
      </div>
    </div>
  )
}
