import { useRef, useState, useEffect } from 'react'
import type { UploadStatus, CutResult } from '../../types'
import { Icon } from '../icons/Icon'
import { Badge } from '../feedback/Badge'

function fmt(t: number): string {
  if (isNaN(t) || t < 0) return '--:--'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatBytes(b: number): string {
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(2)} MB`
}

interface ResultCardProps {
  state: UploadStatus
  result: CutResult | null
  errorMsg: string | null
  onRetry: () => void
}

function MiniWave() {
  return (
    <svg viewBox="0 0 200 36" className="flex-1 h-9 min-w-0">
      {Array.from({ length: 100 }).map((_, i) => {
        const v = 0.3 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.21)) * 0.7
        return (
          <rect
            key={i}
            x={i * 2}
            y={18 - v * 16}
            width="1.2"
            height={v * 32}
            fill="#5EE6D6"
            opacity={0.85}
          />
        )
      })}
    </svg>
  )
}

export function ResultCard({ state, result, errorMsg, onRetry }: ResultCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const downloadUrl = result ? `/api/download/${result.artifact_id}` : ''

  useEffect(() => {
    if (!result) return
    const audio = new Audio(downloadUrl)
    audio.onplay = () => setPlaying(true)
    audio.onpause = () => setPlaying(false)
    audio.onended = () => setPlaying(false)
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
      setPlaying(false)
    }
  }, [result, downloadUrl])

  function togglePlay() {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
    } else {
      a.play().catch(() => {})
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5 min-h-[156px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[14px] font-semibold tracking-tight text-fg">자르기 결과</span>
        {state === 'success' && (
          <Badge tone="ok"><Icon name="check" className="w-3 h-3" />처리 완료</Badge>
        )}
        {state === 'processing' && <Badge tone="cyan">처리 중…</Badge>}
        {state === 'error' && (
          <Badge tone="err"><Icon name="error" className="w-3 h-3" />실패</Badge>
        )}
        {(state === 'empty' || state === 'uploaded') && <Badge tone="mute">대기</Badge>}
      </div>

      {/* Success */}
      {state === 'success' && result && (
        <div className="space-y-3">
          <div className="grid items-center gap-4" style={{ gridTemplateColumns: '1fr 144px' }}>
            <div className="flex items-center gap-3 rounded-xl bg-ink-800 border border-line2/50 px-3 py-3">
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-brand-cyan text-ink-850 grid place-items-center hover:bg-brand-cyan/90 flex-shrink-0 transition-colors"
                aria-label={playing ? '일시정지' : '재생'}
              >
                <Icon name={playing ? 'pause' : 'play'} className="w-4 h-4" />
              </button>
              <div className="min-w-0 flex-shrink-0">
                <div className="text-[13.5px] font-semibold truncate max-w-[180px] text-fg" dir="ltr">
                  {result.suggested_filename}
                </div>
                <div className="text-[11.5px] text-fg-mute font-mono">
                  {fmt(result.duration_seconds)}
                </div>
              </div>
              <MiniWave />
              <Icon name="speaker" className="w-4 h-4 text-fg-mute shrink-0" />
            </div>
            <a
              href={downloadUrl}
              download={result.suggested_filename}
              className="h-12 rounded-lg border border-brand-cyan/60 text-brand-cyan hover:bg-brand-cyan/10 inline-flex items-center justify-center gap-2 font-medium text-[13.5px] transition-colors"
            >
              <Icon name="download" className="w-4 h-4" />
              다운로드
            </a>
          </div>
          <div className="text-[11.5px] text-fg-mute font-mono">
            형식: MP3 · 크기: {formatBytes(result.size_bytes)} · 길이: {fmt(result.duration_seconds)}
          </div>
        </div>
      )}

      {/* Processing */}
      {state === 'processing' && (
        <div className="py-4">
          <div className="flex items-center gap-3 mb-3 text-fg-dim text-[13px]">
            <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse flex-shrink-0" />
            선택 구간을 잘라내는 중입니다…
          </div>
          <div className="h-1.5 bg-ink-500 rounded overflow-hidden">
            <div className="h-full bg-brand-cyan animate-pulse" style={{ width: '65%' }} />
          </div>
        </div>
      )}

      {/* Uploaded */}
      {state === 'uploaded' && (
        <div className="py-6 flex items-center gap-3 text-fg-mute text-[13px]">
          <Icon name="info" className="w-4 h-4 shrink-0" />
          [자르기 실행]을 눌러 결과를 생성하세요.
        </div>
      )}

      {/* Empty */}
      {state === 'empty' && (
        <div className="py-6 flex items-center gap-3 text-fg-mute text-[13px]">
          <Icon name="info" className="w-4 h-4 shrink-0" />
          파일을 업로드하면 자르기 결과가 이곳에 표시됩니다.
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="py-2">
          <div className="flex items-center gap-2 text-err text-[13px] font-medium mb-2">
            <Icon name="error" className="w-4 h-4 shrink-0" />
            처리에 실패했습니다.
          </div>
          <div className="text-[12.5px] text-fg-dim leading-relaxed">
            {errorMsg ?? '자르기 처리에 실패했습니다. 다른 파일로 다시 시도해 주세요.'}
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 h-9 px-3 rounded-md border border-line2 text-fg hover:bg-ink-600 text-[12.5px] transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  )
}
