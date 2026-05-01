import { useState, useEffect } from 'react'
import { useFileStore } from '../../stores/fileStore'
import { useGainPreview } from '../../hooks/useGainPreview'
import { UploadCard } from '../../components/upload/UploadCard'
import { PageHeader } from '../../components/layout/PageHeader'
import { GainSliderPanel } from '../../components/amplify/GainSliderPanel'
import { LevelMeterPanel } from '../../components/amplify/LevelMeterPanel'
import { AmpWaveformCard } from '../../components/amplify/AmpWaveformCard'
import { AmpControlBar } from '../../components/amplify/AmpControlBar'
import { AmpResultCard } from '../../components/amplify/AmpResultCard'
import { AmpGuidanceCard } from '../../components/amplify/AmpGuidanceCard'
import { apiService } from '../../services/api'
import type { FileMeta, UploadStatus, AmpResult } from '../../types'

export function AmplifyPage() {
  const { uploadedFile } = useFileStore()

  const [pageStatus, setPageStatus] = useState<UploadStatus>('empty')
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null)
  const [result,     setResult]     = useState<AmpResult | null>(null)
  const [gainDb,     setGainDb]     = useState(0)
  const [antiClip,   setAntiClip]   = useState(true)
  const [peaks,      setPeaks]      = useState<number[]>([])
  const [audioBlob,  setAudioBlob]  = useState<Blob | null>(null)

  const preview = useGainPreview(audioBlob)

  // 업로드 후 오디오 Blob + 파형 peaks 취득
  useEffect(() => {
    if (!uploadedFile) return
    let cancelled = false

    const fetchAssets = async () => {
      try {
        const audioRes = await fetch(`/api/file/${uploadedFile.file_id}/audio`)
        if (!cancelled && audioRes.ok) {
          setAudioBlob(await audioRes.blob())
        }
        const peaksData = await apiService.getWaveform(uploadedFile.file_id)
        if (!cancelled) setPeaks(peaksData.peaks)
      } catch {
        // 취득 실패 시 파형·미리듣기 기능만 비활성화 (non-fatal)
      }
    }

    fetchAssets()
    return () => { cancelled = true }
  }, [uploadedFile])

  // gain 변경: 페이지 state + Web Audio GainNode 동기화
  function handleGainChange(db: number) {
    setGainDb(db)
    preview.setGainDb(db)
  }

  function handleUploadSuccess(_meta: FileMeta) {
    setErrorMsg(null)
    setResult(null)
    setPeaks([])
    setAudioBlob(null)
    preview.stop()
    setGainDb(0)
    preview.setGainDb(0)
    setPageStatus('uploaded')
  }

  function handleUploadError(msg: string) {
    setErrorMsg(msg)
    setPageStatus('error')
  }

  function handleClear() {
    preview.stop()
    setResult(null)
    setErrorMsg(null)
    setPeaks([])
    setAudioBlob(null)
    setGainDb(0)
    preview.setGainDb(0)
    setPageStatus('empty')
  }

  async function handleRun() {
    if (!uploadedFile) return
    preview.stop()
    setPageStatus('processing')
    setErrorMsg(null)
    setResult(null)
    try {
      const res = await apiService.amplify(uploadedFile.file_id, gainDb, antiClip)
      setResult(res)
      setPageStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '음량 처리에 실패했습니다.')
      setPageStatus('error')
    }
  }

  function handlePreviewToggle() {
    if (preview.isPlaying) preview.stop()
    else preview.play()
  }

  // 실제 peak 기반 클리핑 판정
  const ampScale = Math.min(2.2, Math.pow(10, gainDb / 20))
  const willClip = preview.originalPeakLin > 0 && preview.originalPeakLin * ampScale > 0.99

  return (
    <div className="space-y-5 max-w-[1220px]">
      <PageHeader
        title="음량 증폭"
        description="음원의 전체 볼륨을 dB 단위로 조정합니다. 슬라이더로 게인을 설정하고 미리듣기를 확인하세요."
      />

      <UploadCard
        inputId="amplify-file-input"
        uploadedFile={uploadedFile}
        pageStatus={pageStatus}
        errorMsg={errorMsg}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        onClear={handleClear}
      />

      <AmpWaveformCard
        peaks={peaks}
        gainDb={gainDb}
        durationSec={uploadedFile?.duration_seconds}
        willClip={willClip}
      />

      {/* 게인 슬라이더 + 레벨 미터 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr auto' }}>
        <GainSliderPanel
          gainDb={gainDb}
          antiClip={antiClip}
          onChange={handleGainChange}
          onAntiClipChange={setAntiClip}
        />
        <LevelMeterPanel level={preview.isPlaying ? preview.level : 0} />
      </div>

      <AmpControlBar
        pageStatus={pageStatus}
        previewLoaded={preview.isLoaded}
        previewPlaying={preview.isPlaying}
        onPreviewToggle={handlePreviewToggle}
        onRun={handleRun}
        onReset={handleClear}
      />

      <AmpResultCard
        pageStatus={pageStatus}
        result={result}
        gainDb={gainDb}
        errorMsg={errorMsg}
      />

      <AmpGuidanceCard gainDb={gainDb} willClip={willClip} antiClip={antiClip} />
    </div>
  )
}
