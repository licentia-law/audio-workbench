/**
 * StemChannel
 * 단일 스템 채널 카드: 헤더(색상칩+M/S) + 미니파형+재생 + 음량 + 세로 페이더 + 다운로드.
 * Solo 활성 시 카드 테두리를 brand-cyan으로 강조.
 */
import { Icon } from '../icons/Icon'
import { StemMiniWave } from './StemMiniWave'
import { VerticalFader } from './VerticalFader'
import { formatDuration } from '../../utils/format'
import type { StemId, StemTrack, ChannelState } from '../../types'
import type { IconName } from '../icons/Icon'

export interface StemDef {
  id: StemId
  label: string
  tag: string
  icon: IconName
  color: string
  glow: string
}

export const STEM_DEFS: StemDef[] = [
  { id: 'vocals', label: '보컬',  tag: 'VOCALS', icon: 'mic',        color: '#A78BFA', glow: 'rgba(167,139,250,0.18)' },
  { id: 'drums',  label: '드럼',  tag: 'DRUMS',  icon: 'drum',       color: '#5EE6D6', glow: 'rgba(94,230,214,0.18)'  },
  { id: 'bass',   label: '베이스', tag: 'BASS',  icon: 'bass',       color: '#7C8CFF', glow: 'rgba(124,140,255,0.18)' },
  { id: 'other',  label: '그 외', tag: 'OTHER',  icon: 'other-stem', color: '#F2B544', glow: 'rgba(242,181,68,0.18)'  },
]

interface StemChannelProps {
  def: StemDef
  track: StemTrack
  channelState: ChannelState
  isPlaying: boolean
  positionSec: number
  disabled?: boolean
  suggestedFilename: string
  onGainChange: (db: number) => void
  onMuteToggle: () => void
  onSoloToggle: () => void
  onPlayToggle: () => void
  onDownload: () => void
}

export function StemChannel({
  def,
  track,
  channelState,
  isPlaying,
  positionSec,
  disabled = false,
  suggestedFilename,
  onGainChange,
  onMuteToggle,
  onSoloToggle,
  onPlayToggle,
  onDownload,
}: StemChannelProps) {
  const { gainDb, muted, solo } = channelState
  const progress = track.durationSec > 0 ? positionSec / track.durationSec : 0
  const dbLabel  = gainDb <= -23.9 ? '-∞' : `${gainDb >= 0 ? '+' : ''}${gainDb.toFixed(1)} dB`

  return (
    <div className={`rounded-2xl border bg-ink-700 shadow-card p-4 flex flex-col ${
      solo ? 'border-brand-cyan/60' : 'border-line'
    }`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
            style={{ background: def.glow, color: def.color }}
          >
            <Icon name={def.icon} className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight">{def.label}</div>
            <div className="text-[10px] font-mono tracking-[0.18em] font-semibold" style={{ color: def.color }}>
              {def.tag}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onMuteToggle}
            disabled={disabled}
            title="뮤트"
            aria-pressed={muted}
            className={`w-7 h-7 grid place-items-center rounded-md border text-[10px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              muted
                ? 'bg-err/15 border-err/50 text-err'
                : 'border-line2 text-fg-dim hover:text-fg hover:bg-ink-600'
            }`}
          >
            M
          </button>
          <button
            onClick={onSoloToggle}
            disabled={disabled}
            title="솔로"
            aria-pressed={solo}
            className={`w-7 h-7 grid place-items-center rounded-md border text-[10px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              solo
                ? 'bg-brand-cyan/15 border-brand-cyan/50 text-brand-cyan'
                : 'border-line2 text-fg-dim hover:text-fg hover:bg-ink-600'
            }`}
          >
            S
          </button>
        </div>
      </div>

      {/* 미니 파형 + 재생 */}
      <div className="rounded-lg bg-ink-800 border border-line2/40 p-3">
        <StemMiniWave
          peaks={track.peaks}
          color={def.color}
          playing={isPlaying}
          muted={muted}
          progress={progress}
        />
        <div className="flex items-center justify-between mt-1.5">
          <button
            onClick={onPlayToggle}
            disabled={disabled}
            className="w-7 h-7 grid place-items-center rounded-full text-ink-900 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: def.color }}
          >
            <Icon name={isPlaying ? 'pause' : 'play'} className="w-3 h-3" />
          </button>
          <div className="font-mono text-[11px] text-fg-dim">
            {formatDuration(isPlaying ? positionSec : 0)} / {formatDuration(track.durationSec)}
          </div>
        </div>
      </div>

      {/* 음량 헤더 */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <div className="text-[12px] text-fg-dim">음량</div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onGainChange(0)}
            disabled={disabled}
            title="0 dB로 초기화"
            className="w-6 h-6 grid place-items-center rounded text-fg-dim hover:text-fg hover:bg-ink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="reset" className="w-3.5 h-3.5" />
          </button>
          <div
            className="font-mono text-[12px] px-2 h-6 rounded border border-line2 bg-ink-800 text-fg flex items-center justify-center"
            style={{ minWidth: 64 }}
          >
            {dbLabel}
          </div>
        </div>
      </div>

      {/* 세로 페이더 */}
      <VerticalFader
        value={gainDb}
        onChange={onGainChange}
        color={def.color}
        muted={muted}
        playing={isPlaying}
        disabled={disabled}
      />

      {/* 다운로드 */}
      <button
        type="button"
        onClick={onDownload}
        disabled={disabled}
        className={`mt-4 h-10 rounded-lg border inline-flex items-center justify-center gap-2 text-[13px] transition-colors ${
          disabled
            ? 'border-line2 text-fg-faint cursor-not-allowed opacity-50'
            : 'border-line2 hover:border-brand-cyan/60 hover:bg-brand-cyan/5 text-fg'
        }`}
      >
        <Icon name="download" className="w-4 h-4 text-brand-cyan" />
        다운로드
      </button>
      <div className="font-mono text-[11px] text-fg-dim text-center mt-1.5" dir="ltr">
        {suggestedFilename}
      </div>
    </div>
  )
}
