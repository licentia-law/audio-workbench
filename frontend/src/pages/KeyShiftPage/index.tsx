import { useState, useEffect, useRef, useMemo } from 'react'
import { useFileStore } from '../../stores/fileStore'
import { useKeyShift } from '../../hooks/useKeyShift'
import { useAudioPlayback } from '../../hooks/useAudioPlayback'
import { transposeKey, tonicToIdx } from '../../lib/audio/keyName'
import { UploadCard } from '../../components/upload/UploadCard'
import { PageHeader } from '../../components/layout/PageHeader'
import { OriginalInfoCard } from '../../components/key_shift/OriginalInfoCard'
import { SemitoneControl } from '../../components/key_shift/SemitoneControl'
import { PredictedResultCard } from '../../components/key_shift/PredictedResultCard'
import { GuidanceCard } from '../../components/key_shift/GuidanceCard'
import { ActionBar } from '../../components/key_shift/ActionBar'
import { ConversionResultCard } from '../../components/key_shift/ConversionResultCard'
import { apiService } from '../../services/api'
import type { FileMeta, UploadStatus, AnalysisResult, KeyShiftResult } from '../../types'

export function KeyShiftPage() {
  const { uploadedFile } = useFileStore()

  const [pageStatus, setPageStatus] = useState<UploadStatus>('empty')
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null)
  const [result,     setResult]     = useState<KeyShiftResult | null>(null)
  const [analysis,   setAnalysis]   = useState<AnalysisResult | null>(null)
  const [analyzing,  setAnalyzing]  = useState(false)

  const { semi, set, reset } = useKeyShift()

  // Original audio playback
  const origAudioSrc = uploadedFile ? `/api/file/${uploadedFile.file_id}/audio` : undefined
  const origPlayback = useAudioPlayback(origAudioSrc)

  // Result audio playback — uses download URL once artifact is ready
  const resultAudioSrc = result ? `/api/download/${result.artifactId}` : undefined
  const resultPlayback = useAudioPlayback(resultAudioSrc)

  // Auto-analyze on new upload (background, non-blocking)
  // 새 파일 업로드 또는 언마운트 시 in-flight 요청 결과를 무시 (stale 방지).
  const lastAnalyzedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!uploadedFile) return
    if (lastAnalyzedRef.current === uploadedFile.file_id) return
    lastAnalyzedRef.current = uploadedFile.file_id

    let cancelled = false
    setAnalysis(null)
    setAnalyzing(true)
    apiService.analyze(uploadedFile.file_id)
      .then(r => { if (!cancelled) setAnalysis(r) })
      .catch(() => {})           // 분석 실패는 non-fatal (Unknown으로 처리)
      .finally(() => { if (!cancelled) setAnalyzing(false) })

    return () => { cancelled = true }
  }, [uploadedFile])

  // ── Derived analysis values ──────────────────────────────────────────────
  const keyResult    = analysis?.key ?? null
  const tonicIdx     = tonicToIdx(keyResult?.tonic)
  const mode         = keyResult?.mode ?? null      // 'major' | 'minor' | null
  const isKeyUnknown = !keyResult || keyResult.unknown
  const keyDisplay   = isKeyUnknown ? (analysis ? 'Unknown' : '--') : (keyResult?.pretty ?? '--')
  const bpm          = analysis?.bpm.bpm ?? null
  // Backend용 mode 문자열 ('Major' | 'minor')
  const modeForFilename = mode === 'major' ? 'Major' : mode === 'minor' ? 'minor' : null

  // 실시간 전조 예상 Key
  const predicted = useMemo(
    () => transposeKey(isKeyUnknown ? null : tonicIdx, isKeyUnknown ? null : mode, semi),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tonicIdx, mode, semi, isKeyUnknown],
  )

  // ── Handlers ────────────────────────────────────────────────────────────
  function handleUploadSuccess(_meta: FileMeta) {
    setErrorMsg(null)
    setResult(null)
    setAnalysis(null)
    reset()
    origPlayback.stop()
    resultPlayback.stop()
    setPageStatus('uploaded')
  }

  function handleUploadError(msg: string) {
    setErrorMsg(msg)
    setPageStatus('error')
  }

  function handleClear() {
    origPlayback.stop()
    resultPlayback.stop()
    setResult(null)
    setErrorMsg(null)
    setAnalysis(null)
    setAnalyzing(false)
    lastAnalyzedRef.current = null
    reset()
    setPageStatus('empty')
  }

  function handleReset() {
    reset()
    resultPlayback.stop()
    if (pageStatus === 'success' || pageStatus === 'error') {
      setResult(null)
      setErrorMsg(null)
      setPageStatus('uploaded')
    }
  }

  async function handleConvert() {
    if (!uploadedFile || semi === 0 || pageStatus === 'processing') return
    origPlayback.stop()
    resultPlayback.stop()
    setPageStatus('processing')
    setErrorMsg(null)
    setResult(null)
    try {
      const res = await apiService.keyShift(
        uploadedFile.file_id,
        semi,
        isKeyUnknown ? null : tonicIdx,
        isKeyUnknown ? null : modeForFilename,
      )
      setResult(res)
      setPageStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Key 변환에 실패했습니다.')
      setPageStatus('error')
    }
  }

  function handleOrigPlayToggle() {
    if (origPlayback.isPlaying) origPlayback.stop()
    else origPlayback.playFrom(0)
  }

  function handleResultPlayToggle() {
    if (resultPlayback.isPlaying) resultPlayback.stop()
    else resultPlayback.playFrom(0)
  }

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const locked = pageStatus === 'empty' || pageStatus === 'processing'

      if (e.code === 'Space') {
        e.preventDefault()
        if (pageStatus === 'success') handleResultPlayToggle()
        else if (pageStatus !== 'empty') handleOrigPlayToggle()
      } else if (e.code === 'ArrowLeft' && !locked) {
        e.preventDefault()
        set(semi - (e.shiftKey ? 5 : 1))
      } else if (e.code === 'ArrowRight' && !locked) {
        e.preventDefault()
        set(semi + (e.shiftKey ? 5 : 1))
      } else if ((e.code === 'Digit0' || e.code === 'Numpad0') && !locked) {
        e.preventDefault()
        reset()
      } else if (e.code === 'Enter' && !locked && semi !== 0) {
        e.preventDefault()
        handleConvert()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // playback.isPlaying을 deps에 포함해야 Space 토글이 stale closure 없이 동작.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageStatus, semi, origPlayback.isPlaying, resultPlayback.isPlaying])

  return (
    <div className="space-y-5 max-w-[1220px]">
      <PageHeader
        title="Key 변환"
        description="반음 단위로 키를 조절합니다. 피치 시프트 처리 중 템포는 변경되지 않고 유지됩니다."
      />

      <UploadCard
        inputId="key-shift-file-input"
        uploadedFile={uploadedFile}
        pageStatus={pageStatus}
        errorMsg={errorMsg}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        onClear={handleClear}
      />

      {/* 원본 정보(1/3) + 반음 조절(2/3) */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <OriginalInfoCard
          pageStatus={pageStatus}
          keyDisplay={keyDisplay}
          bpm={bpm}
          isKeyUnknown={isKeyUnknown}
          analyzeLoading={analyzing}
          isPlaying={origPlayback.isPlaying}
          onPlayToggle={handleOrigPlayToggle}
        />
        <SemitoneControl
          pageStatus={pageStatus}
          semi={semi}
          onChange={set}
        />
      </div>

      {/* 예상 결과(1fr) + 안내(fixed) */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 360px' }}>
        <PredictedResultCard
          pageStatus={pageStatus}
          semi={semi}
          originalKeyDisplay={keyDisplay}
          predicted={predicted}
          isKeyUnknown={isKeyUnknown}
        />
        <GuidanceCard isKeyUnknown={isKeyUnknown} />
      </div>

      <ActionBar
        pageStatus={pageStatus}
        semi={semi}
        resultPlaying={resultPlayback.isPlaying}
        onConvert={handleConvert}
        onPlayResult={handleResultPlayToggle}
        onReset={handleReset}
      />

      <ConversionResultCard
        pageStatus={pageStatus}
        semi={semi}
        result={result}
        errorMsg={errorMsg}
        isPlaying={resultPlayback.isPlaying}
        onPlayToggle={handleResultPlayToggle}
      />
    </div>
  )
}
