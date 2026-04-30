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
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/icons/Icon'
import { Badge } from '../../components/feedback/Badge'
import type { FileMeta, UploadStatus, CutResult } from '../../types'

// ── Upload section ──────────────────────────────────────────────────────────

interface UploadSectionProps {
  uploadedFile: FileMeta | null
  pageStatus: UploadStatus
  errorMsg: string | null
  onUploadSuccess: (meta: FileMeta) => void
  onUploadError: (msg: string) => void
  onClear: () => void
}

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(2)} MB`
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
}

function formatSampleRate(hz: number | null | undefined) {
  if (!hz) return '—'
  return `${(hz / 1000).toFixed(1)} kHz`
}

function formatBitrate(bps: number | null | undefined) {
  if (!bps) return '—'
  return `${Math.round(bps / 1000)} kbps`
}

function UploadSection({
  uploadedFile,
  pageStatus,
  errorMsg,
  onUploadSuccess,
  onUploadError,
  onClear,
}: UploadSectionProps) {
  const { setUploadedFile, reset: resetStore } = useFileStore()
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const MAX_SIZE = 20 * 1024 * 1024
  const MAX_DURATION = 600

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
  const uploaded = !!uploadedFile

  function handleClear() {
    setLocalError(null)
    resetStore()
    onClear()
  }

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
          <div
            className={`w-9 h-9 rounded-full grid place-items-center mb-2 ${
              uploaded ? 'bg-ink-600 text-fg-mute' : 'bg-brand-cyan/15 text-brand-cyan'
            }`}
          >
            <Icon name="upload" className="w-4 h-4" />
          </div>
          <div className="text-[13.5px] text-fg">오디오 파일을 드래그&드롭 하세요</div>
          <div className="text-[11.5px] text-fg-mute my-1">또는</div>
          <button
            type="button"
            className="px-3.5 h-8 rounded-md bg-brand-cyan text-ink-850 text-[12.5px] font-semibold hover:bg-brand-cyan/90 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              document.getElementById('cut-file-input')?.click()
            }}
          >
            파일 선택
          </button>
          <div className="text-[11px] text-fg-mute mt-2.5">지원 형식: MP3 · 최대 10분 · 20MB</div>
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
                  className="w-9 h-9 grid place-items-center rounded-md border border-line2 text-fg-mute hover:text-err hover:border-err/50 transition-colors"
                  aria-label="파일 제거"
                >
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {[
                  ['길이', formatDuration(uploadedFile.duration_seconds)],
                  ['크기', formatBytes(uploadedFile.size_bytes)],
                  ['형식', 'MP3'],
                  ['샘플레이트', formatSampleRate(uploadedFile.sample_rate)],
                  ['비트레이트', formatBitrate(uploadedFile.bit_rate)],
                ].map(([k, v]) => (
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

  const handleClear = useCallback(() => {
    playback.stop()
    setPeaks(undefined)
    setResult(null)
    setErrorMsg(null)
    setPageStatus('empty')
  }, [playback])

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
      <PageHeader title="음원 자르기" description="원하는 구간만 선택하여 잘라낼 수 있습니다." />

      {/* Upload + Meta */}
      <UploadSection
        uploadedFile={uploadedFile}
        pageStatus={pageStatus}
        errorMsg={errorMsg}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        onClear={handleClear}
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
        volume={playback.volume}
        onVolumeChange={playback.setVolume}
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
