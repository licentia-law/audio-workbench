/**
 * ConversionResultCard
 * 상태별 변환 결과 카드.
 * empty/uploaded → 안내 텍스트
 * processing     → 진행 바 + 안내
 * success        → 파일 정보 + 재생 + 다운로드
 * error          → 에러 메시지 + 재시도 안내
 */
import { Icon } from '../icons/Icon'
import { formatDuration, formatBytes, formatSemitone } from '../../utils/format'
import type { UploadStatus, KeyShiftResult } from '../../types'

interface ConversionResultCardProps {
  pageStatus: UploadStatus
  semi: number
  result: KeyShiftResult | null
  errorMsg: string | null
  isPlaying: boolean
  onPlayToggle: () => void
}

export function ConversionResultCard({
  pageStatus,
  semi,
  result,
  errorMsg,
  isPlaying,
  onPlayToggle,
}: ConversionResultCardProps) {
  const badgeTone: Record<UploadStatus, { label: string; cls: string }> = {
    empty:      { label: '대기',    cls: 'bg-ink-600 text-fg-dim' },
    uploaded:   { label: '대기',    cls: 'bg-ink-600 text-fg-dim' },
    processing: { label: '처리 중', cls: 'bg-brand-cyan/15 text-brand-cyan' },
    success:    { label: '변환 완료', cls: 'bg-ok/15 text-ok' },
    error:      { label: '실패',    cls: 'bg-err/15 text-err' },
  }
  const badge = badgeTone[pageStatus]

  return (
    <div className="rounded-2xl border border-line bg-ink-700 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Icon name="wave" className="w-4 h-4 text-brand-cyan" />
        <span className="text-[14px] font-semibold tracking-tight">변환 결과</span>
        <span className={`ml-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {/* empty / uploaded */}
      {(pageStatus === 'empty' || pageStatus === 'uploaded') && (
        <div className="py-5 flex items-center gap-2.5 text-fg-dim text-[13px]">
          <Icon name="info" className="w-4 h-4 shrink-0" />
          {pageStatus === 'empty'
            ? '파일을 업로드하면 변환 결과가 이곳에 표시됩니다.'
            : '[변환 실행]을 눌러 결과를 생성하세요. (반음이 0이면 변환되지 않습니다.)'}
        </div>
      )}

      {/* processing */}
      {pageStatus === 'processing' && (
        <div className="py-2 space-y-3">
          <div className="flex items-center gap-2.5 text-fg-dim text-[13px]">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse shrink-0" />
            반음 단위로 키를 변환하는 중입니다…
          </div>
          <div className="h-1.5 bg-ink-500 rounded-full overflow-hidden">
            <div className="h-full bg-brand-cyan rounded-full animate-pulse w-2/3" />
          </div>
          <div className="text-[11.5px] text-fg-dim tabular-nums">
            템포 유지 처리 중 · 잠시만 기다려 주세요
          </div>
        </div>
      )}

      {/* success */}
      {pageStatus === 'success' && result && (
        <div className="space-y-3">
          {/* File row */}
          <div className="flex items-center gap-3 rounded-xl bg-ink-800 border border-line2/50 px-3 py-2.5">
            {/* Play button */}
            <button
              onClick={onPlayToggle}
              className="w-10 h-10 rounded-full bg-brand-cyan text-ink-850 grid place-items-center hover:bg-cyan-300 shrink-0 transition-colors"
            >
              <Icon name={isPlaying ? 'pause' : 'play'} className="w-4 h-4" />
            </button>

            {/* File name + duration */}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">{result.suggestedFilename}</div>
              <div className="text-[11px] text-fg-dim mt-0.5 tabular-nums">
                {formatDuration(result.durationSec)} · {formatBytes(result.sizeBytes)}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-5 text-[11.5px] text-fg-dim tabular-nums px-1">
            <span>반음 변화: <span className="text-fg">{formatSemitone(semi)} semitone</span></span>
            <span>템포: <span className="text-ok">유지</span></span>
            <span>형식: <span className="text-fg">MP3 · 192 kbps</span></span>
          </div>

          {/* Download */}
          <a
            href={`/api/download/${result.artifactId}`}
            download={result.suggestedFilename}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-brand-cyan/60 text-brand-cyan hover:bg-brand-cyan/10 font-medium text-[13.5px] transition-colors"
          >
            <Icon name="download" className="w-4 h-4" />
            다운로드
          </a>
        </div>
      )}

      {/* error */}
      {pageStatus === 'error' && (
        <div className="py-1 space-y-2">
          <div className="flex items-center gap-2 text-err text-[13px] font-medium">
            <Icon name="error" className="w-4 h-4 shrink-0" />
            Key 변환 처리에 실패했습니다.
          </div>
          <div className="text-[12.5px] text-fg-dim leading-relaxed">
            {errorMsg ?? '피치 시프트 처리 중 오류가 발생했습니다. 다른 mp3 파일로 다시 시도해 주세요.'}
          </div>
        </div>
      )}
    </div>
  )
}
