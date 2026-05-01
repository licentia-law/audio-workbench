import { useState, useCallback, useEffect } from 'react'
import { useFileStore } from '../../stores/fileStore'
import { useStemSeparation, STEM_IDS } from '../../hooks/useStemSeparation'
import { useStemMixer } from '../../hooks/useStemMixer'
import { useStemMixRender } from '../../hooks/useStemMixRender'
import { PageHeader } from '../../components/layout/PageHeader'
import { StemUploadCard } from '../../components/stems/StemUploadCard'
import { StemChannel, STEM_DEFS } from '../../components/stems/StemChannel'
import { StemMasterPanel } from '../../components/stems/StemMasterPanel'
import { StemNoticeCard } from '../../components/stems/StemNoticeCard'
import { Icon } from '../../components/icons/Icon'
import type { FileMeta, UploadStatus, MixerState, StemId, ChannelState } from '../../types'

// ── 기본 MixerState ──────────────────────────────────────────────────────────
function defaultChannelState(): ChannelState {
  return { gainDb: 0, muted: false, solo: false }
}

function defaultMixerState(): MixerState {
  return {
    channels: {
      vocals: defaultChannelState(),
      drums:  defaultChannelState(),
      bass:   defaultChannelState(),
      other:  defaultChannelState(),
    },
    masterDb: 0,
  }
}

// ── 채널 그리드 플레이스홀더 ─────────────────────────────────────────────────
function MixerPlaceholder({ message }: { message: string }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {STEM_DEFS.map(def => (
        <div key={def.id} className="rounded-2xl border border-line bg-ink-700 h-[440px] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: def.glow, color: def.color }}>
            <Icon name={def.icon} className="w-5 h-5" />
          </div>
          <div className="text-[12px] text-fg-dim text-center px-4">{message}</div>
        </div>
      ))}
    </div>
  )
}

function MixerSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {STEM_DEFS.map(def => (
        <div key={def.id} className="rounded-2xl border border-line bg-ink-700 h-[440px] p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg animate-pulse bg-ink-500" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-ink-500 rounded animate-pulse w-16" />
              <div className="h-2 bg-ink-500 rounded animate-pulse w-10" />
            </div>
          </div>
          <div className="rounded-lg bg-ink-800 h-[100px] animate-pulse" />
          <div className="flex-1 rounded-lg bg-ink-800 animate-pulse" />
          <div className="h-10 rounded-lg bg-ink-800 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

// ── StemMixPage ──────────────────────────────────────────────────────────────
export function StemMixPage() {
  const { uploadedFile } = useFileStore()

  const [pageStatus,  setPageStatus]  = useState<UploadStatus>('empty')
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null)
  const [mixerState,  setMixerState]  = useState<MixerState>(defaultMixerState())

  const separation = useStemSeparation()
  const mixer      = useStemMixer(separation.tracks, mixerState)
  const render     = useStemMixRender()

  // ── 페이지 상태 동기화 ────────────────────────────────────────────────────
  useEffect(() => {
    if (separation.status === 'separating') setPageStatus('processing')
    else if (separation.status === 'done')  setPageStatus('success')
    else if (separation.status === 'error') {
      setPageStatus('error')
      setErrorMsg(separation.errorMsg)
    }
  }, [separation.status, separation.errorMsg])

  // ── 핸들러 ────────────────────────────────────────────────────────────────
  function handleUploadSuccess(_meta: FileMeta) {
    separation.reset()
    setMixerState(defaultMixerState())
    setErrorMsg(null)
    setPageStatus('uploaded')
  }

  function handleUploadError(msg: string) {
    setErrorMsg(msg)
    setPageStatus('error')
  }

  function handleClear() {
    mixer.stop()
    separation.reset()
    setMixerState(defaultMixerState())
    setErrorMsg(null)
    setPageStatus('empty')
  }

  function handleSeparate() {
    if (!uploadedFile) return
    mixer.stop()
    setMixerState(defaultMixerState())
    setErrorMsg(null)
    separation.separate(uploadedFile.file_id)
  }

  // ── MixerState setters ────────────────────────────────────────────────────
  const setChannelGain = useCallback((id: StemId, db: number) => {
    setMixerState(prev => ({
      ...prev,
      channels: { ...prev.channels, [id]: { ...prev.channels[id], gainDb: db } },
    }))
  }, [])

  const toggleMute = useCallback((id: StemId) => {
    setMixerState(prev => ({
      ...prev,
      channels: { ...prev.channels, [id]: { ...prev.channels[id], muted: !prev.channels[id].muted } },
    }))
  }, [])

  const toggleSolo = useCallback((id: StemId) => {
    setMixerState(prev => ({
      ...prev,
      channels: { ...prev.channels, [id]: { ...prev.channels[id], solo: !prev.channels[id].solo } },
    }))
  }, [])

  const setMasterGain = useCallback((db: number) => {
    setMixerState(prev => ({ ...prev, masterDb: db }))
  }, [])

  function resetFaders() {
    setMixerState(prev => ({
      ...prev,
      masterDb: 0,
      channels: Object.fromEntries(
        STEM_IDS.map(id => [id, { ...prev.channels[id], gainDb: 0 }])
      ) as Record<StemId, ChannelState>,
    }))
  }

  // ── 개별 스템 다운로드 ────────────────────────────────────────────────────
  function handleStemDownload(id: StemId) {
    if (!separation.stems) return
    const info = separation.stems[id]
    const a = document.createElement('a')
    a.href = `/api/download/${info.artifactId}`
    a.download = info.suggestedFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // ── 믹스 렌더 ────────────────────────────────────────────────────────────
  function handleRenderMix() {
    if (!separation.stems || !uploadedFile) return
    render.renderMix({
      stems: separation.stems,
      mixerState,
      originalName: uploadedFile.original_name,
    })
  }

  // ── 플레이/일시정지 토글 ──────────────────────────────────────────────────
  function handlePlayToggle() {
    if (mixer.isPlaying) mixer.stop()
    else mixer.play()
  }

  // ── 정지 (처음으로) ───────────────────────────────────────────────────────
  function handleStop() {
    mixer.stopReset()
  }

  // ── 씩 (파형 클릭) ────────────────────────────────────────────────────────
  function handleSeek(sec: number) {
    mixer.seekTo(sec)
  }

  // ── 믹스 파형 표시용 durationSec ─────────────────────────────────────────
  const durationSec = separation.stems
    ? Math.max(...STEM_IDS.map(id => separation.stems![id].durationSec))
    : 0

  // ── 키보드 단축키 ─────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const canInteract = pageStatus === 'success'

      if (e.code === 'Space') {
        e.preventDefault()
        if (canInteract) handlePlayToggle()
      } else if (e.code === 'Digit1') { e.preventDefault(); if (canInteract) toggleMute('vocals') }
      else if (e.code === 'Digit2') { e.preventDefault(); if (canInteract) toggleMute('drums') }
      else if (e.code === 'Digit3') { e.preventDefault(); if (canInteract) toggleMute('bass') }
      else if (e.code === 'Digit4') { e.preventDefault(); if (canInteract) toggleMute('other') }
      else if (e.code === 'KeyR' && canInteract) { e.preventDefault(); resetFaders() }
      else if (e.code === 'Enter' && canInteract && !render.rendering) {
        e.preventDefault(); handleRenderMix()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // 핵심 deps:
    //  - mixer.isPlaying → handlePlayToggle stale closure 방지
    //  - mixerState/separation.stems/uploadedFile → handleRenderMix가 최신 값 사용
    //  - render.rendering → Enter 가드용
    // toggleMute는 useCallback([])로 stable이지만 ESLint 만족 위해 포함.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pageStatus,
    mixer.isPlaying,
    render.rendering,
    toggleMute,
    mixerState,
    separation.stems,
    uploadedFile,
  ])

  // ── render ────────────────────────────────────────────────────────────────
  const showChannels = pageStatus === 'success' && !!separation.tracks

  return (
    <div className="space-y-5 max-w-[1220px]">
      <PageHeader
        title="스템 분리 / 믹스"
        description="mp3를 4개 스템으로 분리하고 음량을 조절해 Mixed 결과를 저장할 수 있습니다."
      />

      {/* 업로드 + 분리 실행 카드 */}
      <StemUploadCard
        pageStatus={pageStatus}
        progress={separation.progress}
        errorMsg={errorMsg}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        onSeparate={handleSeparate}
        onClear={handleClear}
      />

      {/* 4채널 믹서 그리드 */}
      {pageStatus === 'empty' && (
        <MixerPlaceholder message="파일을 업로드하면 4개 채널이 이곳에 표시됩니다." />
      )}
      {pageStatus === 'uploaded' && (
        <MixerPlaceholder message="[스템 분리 실행]을 눌러 4채널로 분리하세요." />
      )}
      {pageStatus === 'processing' && <MixerSkeleton />}
      {pageStatus === 'error' && (
        <MixerPlaceholder message="분리에 실패했습니다. 다시 시도하세요." />
      )}
      {showChannels && (
        <div className="grid grid-cols-4 gap-4">
          {STEM_DEFS.map(def => {
            const track = separation.tracks![def.id]
            const info  = separation.stems![def.id]
            return (
              <StemChannel
                key={def.id}
                def={def}
                track={track}
                channelState={mixerState.channels[def.id]}
                isPlaying={mixer.isPlaying}
                positionSec={mixer.positionSec}
                suggestedFilename={info.suggestedFilename}
                onGainChange={db => setChannelGain(def.id, db)}
                onMuteToggle={() => toggleMute(def.id)}
                onSoloToggle={() => toggleSolo(def.id)}
                onPlayToggle={handlePlayToggle}
                onDownload={() => handleStemDownload(def.id)}
              />
            )
          })}
        </div>
      )}

      {/* 마스터 믹스 패널 */}
      <StemMasterPanel
        pageStatus={pageStatus}
        masterDb={mixerState.masterDb}
        isPlaying={mixer.isPlaying}
        positionSec={mixer.positionSec}
        durationSec={mixer.durationSec || durationSec}
        level={mixer.level}
        rendering={render.rendering}
        onMasterChange={setMasterGain}
        onPlayToggle={handlePlayToggle}
        onStop={handleStop}
        onSeek={handleSeek}
        onRenderMix={handleRenderMix}
      />

      {/* 안내 카드 */}
      <StemNoticeCard pageStatus={pageStatus} errorMsg={errorMsg} />
    </div>
  )
}
