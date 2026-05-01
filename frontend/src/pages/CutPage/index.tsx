import { useState, useCallback } from 'react'
import { useFileStore } from '../../stores/fileStore'
import { apiService } from '../../services/api'
import { useTrimSelection } from '../../hooks/useTrimSelection'
import { useAudioPlayback } from '../../hooks/useAudioPlayback'
import { UploadCard } from '../../components/upload/UploadCard'
import { WaveformCard } from '../../components/trim/WaveformCard'
import { SelectionInfo } from '../../components/trim/SelectionInfo'
import { ControlBar } from '../../components/trim/ControlBar'
import { ResultCard } from '../../components/trim/ResultCard'
import { GuidanceCard } from '../../components/trim/GuidanceCard'
import { PageHeader } from '../../components/layout/PageHeader'
import type { FileMeta, UploadStatus, CutResult } from '../../types'

// ── CutPage ─────────────────────────────────────────────────────────────────

export function CutPage() {
  const { uploadedFile } = useFileStore()
  const [pageStatus, setPageStatus] = useState<UploadStatus>('empty')
  const [peaks, setPeaks] = useState<number[] | undefined>()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [result, setResult] = useState<CutResult | null>(null)

  const audioSrc = uploadedFile ? `/api/file/${uploadedFile.file_id}/audio` : undefined

  const sel = useTrimSelection(uploadedFile?.duration_seconds ?? 0)
  const playback = useAudioPlayback(audioSrc)

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
      <UploadCard
        inputId="cut-file-input"
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
