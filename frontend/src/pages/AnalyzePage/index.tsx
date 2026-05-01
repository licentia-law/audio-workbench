import { useState, useCallback } from 'react'
import { useFileStore } from '../../stores/fileStore'
import { useAnalysisJob } from '../../hooks/useAnalysisJob'
import { useAudioPlayback } from '../../hooks/useAudioPlayback'
import { UploadCard } from '../../components/upload/UploadCard'
import { PageHeader } from '../../components/layout/PageHeader'
import { RunBar } from '../../components/analyze/RunBar'
import { ResultBigCard } from '../../components/analyze/ResultBigCard'
import { NoticeCard } from '../../components/analyze/NoticeCard'
import { LoudnessCard } from '../../components/analyze/LoudnessCard'
import { StepListCard } from '../../components/analyze/StepListCard'
import { FootNotice } from '../../components/analyze/FootNotice'
import type { FileMeta, UploadStatus, AnalysisResult } from '../../types'

// ── AnalyzePage ────────────────────────────────────────────────────────────

export function AnalyzePage() {
  const { uploadedFile } = useFileStore()
  const [pageStatus, setPageStatus] = useState<UploadStatus>('empty')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const audioSrc = uploadedFile ? `/api/file/${uploadedFile.file_id}/audio` : undefined
  const playback = useAudioPlayback(audioSrc)
  const job = useAnalysisJob()

  // per-step progress 계산용 (overall → key/bpm/loudness 구간)
  const { overallProgress } = job
  const keyProg  = Math.max(0, Math.min(1, (overallProgress - 0.30) / 0.40))
  const bpmProg  = Math.max(0, Math.min(1, (overallProgress - 0.70) / 0.25))
  const loudProg = Math.max(0, Math.min(1, (overallProgress - 0.95) / 0.05))

  const handleUploadSuccess = useCallback((_meta: FileMeta) => {
    setErrorMsg(null)
    setResult(null)
    job.reset()
    setPageStatus('uploaded')
  }, [job])

  const handleUploadError = useCallback((msg: string) => {
    setErrorMsg(msg)
    setPageStatus('error')
  }, [])

  function handleClear() {
    playback.stop()
    setResult(null)
    setErrorMsg(null)
    job.reset()
    setPageStatus('empty')
  }

  async function handleRun() {
    if (!uploadedFile) return
    playback.stop()
    setPageStatus('processing')
    setErrorMsg(null)
    setResult(null)
    try {
      const res = await job.run(uploadedFile.file_id)
      setResult(res)
      // 둘 다 Unknown이면 error, 아니면 success
      if (res.key.unknown && res.bpm.unknown) {
        setPageStatus('error')
        setErrorMsg('음원 분석에 실패했습니다. 다른 파일로 다시 시도해 주세요.')
      } else {
        setPageStatus('success')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '음원 분석에 실패했습니다.'
      setErrorMsg(msg)
      setPageStatus('error')
    }
  }

  const isSuccess = pageStatus === 'success'
  const isProcessing = pageStatus === 'processing'

  // FootNotice 표시 조건
  const showErrNotice  = pageStatus === 'error'
  const showWarnNotice = isSuccess && (result?.key.unknown || result?.bpm.unknown) && !(result?.key.unknown && result?.bpm.unknown)
  const showInfoNotice = !showErrNotice && !showWarnNotice

  return (
    <div className="space-y-5 max-w-[1220px]">
      <PageHeader title="음원 분석" description="업로드한 음원의 Key와 BPM을 참고용으로 분석합니다." />

      {/* Upload */}
      <UploadCard
        inputId="analyze-file-input"
        uploadedFile={uploadedFile}
        pageStatus={pageStatus}
        errorMsg={errorMsg}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        onClear={handleClear}
      />

      {/* Run bar */}
      <RunBar
        state={pageStatus}
        isPlaying={playback.isPlaying}
        onPlay={() => playback.playFrom(0)}
        onStop={playback.stop}
        onRun={handleRun}
      />

      {/* 3열: Key / BPM / Notice */}
      <div className="grid grid-cols-3 gap-5">
        <ResultBigCard
          icon="key"
          title="Key"
          state={pageStatus}
          value={result?.key.pretty ?? '— —'}
          caption="조성"
          captionSub={result?.key.tonic ? `${result.key.tonic} ${result.key.mode === 'major' ? '메이저' : '마이너'}` : undefined}
          progress={isProcessing ? keyProg : 0}
          unknown={isSuccess && (result?.key.unknown ?? false)}
        />
        <ResultBigCard
          icon="metronome"
          title="BPM"
          state={pageStatus}
          value={result?.bpm.bpm != null ? String(Math.round(result.bpm.bpm)) : (isSuccess ? 'Unknown' : '— —')}
          unit={result?.bpm.bpm != null && isSuccess && !result.bpm.unknown ? 'BPM' : undefined}
          caption="템포"
          captionSub="Beats Per Minute"
          progress={isProcessing ? bpmProg : 0}
          unknown={isSuccess && (result?.bpm.unknown ?? false)}
        />
        <NoticeCard />
      </div>

      {/* 2열: Loudness / StepList */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <LoudnessCard
          state={pageStatus}
          peakDb={result?.loudness.peak_db}
          rmsDb={result?.loudness.rms_db}
          progress={isProcessing ? loudProg : 0}
        />
        <StepListCard state={pageStatus} steps={job.steps} />
      </div>

      {/* 하단 안내 */}
      {showErrNotice && (
        <FootNotice
          tone="err"
          icon="error"
          title="음원 분석에 실패했습니다."
          body={errorMsg ?? '다른 mp3 파일로 다시 시도해 주세요.'}
        />
      )}
      {showWarnNotice && (
        <FootNotice
          tone="warn"
          icon="warn"
          title="일부 항목을 추정하지 못했습니다."
          body="조성 또는 템포 추정 신뢰도가 낮아 Unknown으로 표시됩니다. 다시 시도해 주세요."
        />
      )}
      {showInfoNotice && (
        <FootNotice
          tone="warn"
          icon="warn"
          title="분석 결과는 참고용 추정값입니다."
          body="실제 조성·템포와 다를 수 있으며, 결과는 참고 목적으로만 사용해 주세요."
        />
      )}
    </div>
  )
}
