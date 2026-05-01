/**
 * StemMasterPanel
 * 3-column: 믹스 파형+재생(1fr) | 마스터 음량 슬라이더(360px) | Mixed 다운로드(220px)
 */
import { Icon } from '../icons/Icon'
import { Badge } from '../feedback/Badge'
import { genMixPeaks } from '../../hooks/useStemSeparation'
import type { UploadStatus } from '../../types'

const MIX_WAVE = genMixPeaks(500)

const MIN_DB = -24
const MAX_DB = 12
const ZERO_PCT = ((0 - MIN_DB) / (MAX_DB - MIN_DB)) * 100  // ≈ 66.7%

interface StemMasterPanelProps {
  pageStatus: UploadStatus
  masterDb: number
  isPlaying: boolean
  positionSec: number
  durationSec: number
  level: number        // 0~1 (AnalyserNode peak)
  rendering: boolean
  onMasterChange: (db: number) => void
  onPlayToggle: () => void
  onStop: () => void
  onSeek: (sec: number) => void
  onRenderMix: () => void
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60)
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
}

export function StemMasterPanel({
  pageStatus,
  masterDb,
  isPlaying,
  positionSec,
  durationSec,
  level,
  rendering,
  onMasterChange,
  onPlayToggle,
  onStop,
  onSeek,
  onRenderMix,
}: StemMasterPanelProps) {
  const ready    = pageStatus === 'success'
  const pct      = ((masterDb - MIN_DB) / (MAX_DB - MIN_DB)) * 100
  const sign     = masterDb >= 0 ? '+' : ''
  const dbLabel  = masterDb <= -23.9 ? '-∞' : `${sign}${masterDb.toFixed(1)}`
  const progress = durationSec > 0 ? positionSec / durationSec : 0

  const valueColor = !ready
    ? 'text-fg-faint'
    : masterDb > 6
      ? 'text-warn'
      : masterDb < 0
        ? 'text-brand-indigo'
        : 'text-brand-cyan'

  // level meter bar (master output)
  const meterH = ready ? `${Math.min(level * 120, 100)}%` : '0%'

  // 파형 클릭 → seek
  function handleWaveClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!ready || durationSec <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1))
    onSeek(ratio * durationSec)
  }

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-line2/40">
        <div className="w-7 h-7 rounded-md bg-brand-cyan/15 border border-brand-cyan/30 grid place-items-center text-brand-cyan">
          <Icon name="mix" className="w-4 h-4" />
        </div>
        <div className="text-[14px] font-semibold tracking-tight">마스터 믹스</div>
        {ready       && <Badge tone="ok"><Icon name="check" className="w-3 h-3" />믹스 준비</Badge>}
        {pageStatus === 'processing' && <Badge tone="cyan">분리 중…</Badge>}
        {pageStatus === 'error'      && <Badge tone="err">실패</Badge>}
        {(pageStatus === 'empty' || pageStatus === 'uploaded') && <Badge tone="mute">대기</Badge>}
      </div>

      {/* 3-column body */}
      <div className="grid p-5 gap-5" style={{ gridTemplateColumns: '1fr 360px 220px' }}>

        {/* Left — 믹스 파형 + 재생 컨트롤 */}
        <div className="flex flex-col gap-2">
          <div className="text-[12px] text-fg-dim">믹스 파형</div>
          <div className="rounded-xl bg-ink-800 border border-line2/40 p-3 flex flex-col justify-between flex-1">
            {/* SVG 파형 */}
            <div className="relative">
              <svg
                viewBox={`0 0 ${MIX_WAVE.length} 100`}
                preserveAspectRatio="none"
                className={`w-full h-[64px] ${ready ? 'cursor-pointer' : ''}`}
                onClick={handleWaveClick}
              >
                <defs>
                  <linearGradient id="mpDim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3A4670" /><stop offset="1" stopColor="#222B47" />
                  </linearGradient>
                  <linearGradient id="mpHot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7CF0E0" /><stop offset="1" stopColor="#2DBEAE" />
                  </linearGradient>
                  <clipPath id="mpPlayed">
                    <rect x="0" y="0" width={MIX_WAVE.length * progress} height="100" />
                  </clipPath>
                </defs>
                {/* dim bars */}
                <g fill="url(#mpDim)" opacity={ready ? 1 : 0.3}>
                  {MIX_WAVE.map((v, i) => (
                    <rect key={i} x={i + 0.15} y={50 - v * 44} width={0.7} height={v * 88} rx="0.3" />
                  ))}
                </g>
                {/* hot bars */}
                {ready && (
                  <g fill="url(#mpHot)" clipPath="url(#mpPlayed)">
                    {MIX_WAVE.map((v, i) => (
                      <rect key={i} x={i + 0.15} y={50 - v * 44} width={0.7} height={v * 88} rx="0.3" />
                    ))}
                  </g>
                )}
                {/* 재생 헤드 — 재생 중 or 일시정지 위치에 표시 */}
                {ready && positionSec > 0 && (
                  <line
                    x1={MIX_WAVE.length * progress} y1="0"
                    x2={MIX_WAVE.length * progress} y2="100"
                    stroke="#FFB347" strokeWidth="0.8"
                    opacity={isPlaying ? 1 : 0.6}
                  />
                )}
                {!ready && (
                  <rect x="0" y="0" width={MIX_WAVE.length} height="100" fill="rgba(7,11,24,0.55)" />
                )}
              </svg>
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center text-[12px] text-fg-dim pointer-events-none">
                  스템 분리 후 활성화됩니다
                </div>
              )}
            </div>
            {/* transport */}
            <div className="flex items-center justify-between mt-2.5">
              {/* 재생 컨트롤 버튼 묶음 */}
              <div className="flex items-center gap-1.5">
                {/* 재생 / 일시정지 */}
                <button
                  disabled={!ready}
                  onClick={onPlayToggle}
                  title={isPlaying ? '일시정지' : '재생'}
                  className={`w-9 h-9 rounded-full grid place-items-center transition-colors ${
                    ready
                      ? 'bg-brand-cyan text-ink-900 hover:bg-brand-cyan/90'
                      : 'bg-ink-500 text-fg-faint cursor-not-allowed'
                  }`}
                >
                  <Icon name={isPlaying ? 'pause' : 'play'} className="w-4 h-4" />
                </button>
                {/* 정지 (처음으로) */}
                <button
                  disabled={!ready || (!isPlaying && positionSec === 0)}
                  onClick={onStop}
                  title="멈춤 (처음으로)"
                  className={`w-8 h-8 rounded-lg grid place-items-center transition-colors ${
                    ready && (isPlaying || positionSec > 0)
                      ? 'bg-ink-600 text-fg hover:bg-ink-500'
                      : 'bg-ink-600 text-fg-faint cursor-not-allowed opacity-40'
                  }`}
                >
                  <Icon name="stop" className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="font-mono text-[11px] text-fg-dim">
                {ready ? `${fmtTime(positionSec)} / ${fmtTime(durationSec)}` : '--:-- / --:--'}
              </div>
              {/* 레벨 미터 바 (작은 세로 막대) */}
              <div className="relative w-2 h-9 bg-ink-600 rounded-sm overflow-hidden">
                <div
                  className="absolute inset-x-0 bottom-0 rounded-sm bg-brand-cyan transition-[height] duration-[80ms] linear"
                  style={{ height: meterH }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center — 마스터 음량 슬라이더 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-[12px] text-fg-dim">마스터 음량</div>
            <div className={`font-mono text-[13px] font-semibold ${ready ? (masterDb > 6 ? 'text-warn' : 'text-fg') : 'text-fg-faint'}`}>
              {ready ? `${dbLabel} dB` : '-- dB'}
            </div>
          </div>
          <div className={`rounded-xl bg-ink-800 border border-line2/40 p-4 flex flex-col gap-3 flex-1 justify-center ${!ready ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* 큰 숫자 */}
            <div className="flex items-baseline justify-center gap-1">
              <div className={`font-mono text-[42px] font-semibold leading-none tracking-tight ${valueColor}`}>
                {ready ? dbLabel : '--'}
              </div>
              <div className="font-mono text-[14px] text-fg-dim">dB</div>
            </div>
            {/* 슬라이더 */}
            <div className="relative select-none px-2">
              <div className="relative h-2 rounded-full bg-ink-500">
                {/* 음수 구간 tint (indigo) */}
                <div className="absolute inset-y-0 left-0 rounded-l-full bg-brand-indigo/20" style={{ width: `${ZERO_PCT}%` }} />
                {/* 양수 과잉 구간 tint (warn) */}
                <div className="absolute inset-y-0 rounded-r-full bg-warn/20" style={{ left: '75%', right: 0 }} />
                {/* fill bar */}
                {masterDb >= 0 ? (
                  <div className="absolute inset-y-0 rounded-full bg-brand-cyan"
                    style={{ left: `${ZERO_PCT}%`, width: `${Math.max(0, pct - ZERO_PCT)}%` }} />
                ) : (
                  <div className="absolute inset-y-0 rounded-full bg-brand-indigo"
                    style={{ left: `${pct}%`, width: `${Math.max(0, ZERO_PCT - pct)}%` }} />
                )}
                {/* 0 dB 노치 */}
                <div className="absolute top-1/2 -translate-y-1/2 w-px h-4 bg-fg-dim/60" style={{ left: `${ZERO_PCT}%` }} />
                {/* 투명 range input */}
                <input
                  type="range" min={MIN_DB} max={MAX_DB} step={0.1}
                  value={masterDb}
                  onChange={e => onMasterChange(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ margin: 0 }}
                />
                {/* thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-fg ring-2 ring-ink-700 shadow-handle pointer-events-none"
                  style={{ left: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10.5px] text-fg-dim font-mono mt-2.5">
                <span>-24</span><span>-12</span>
                <span className="text-fg-dim font-medium">0</span>
                <span>+6</span>
                <span className="text-warn">+12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Mixed 다운로드 */}
        <div className="flex flex-col gap-2">
          <div className="text-[12px] text-fg-dim">Mixed 저장</div>
          <div className="rounded-xl bg-ink-800 border border-line2/40 p-4 flex flex-col justify-between flex-1">
            <div className="text-[12.5px] text-fg-dim leading-relaxed">
              현재 페이더 설정으로 4개 채널을 합산한 결과를 저장합니다.
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <button
                disabled={!ready || rendering}
                onClick={onRenderMix}
                className={`h-12 rounded-lg inline-flex items-center justify-center gap-2 text-[13.5px] font-semibold border transition-colors ${
                  !ready || rendering
                    ? 'bg-ink-500 text-fg-dim border-line2 cursor-not-allowed'
                    : 'bg-brand-cyan text-ink-850 border-brand-cyan hover:bg-brand-cyan/90'
                }`}
              >
                <Icon name={rendering ? 'dots' : 'download'} className={`w-4 h-4 ${rendering ? 'animate-pulse' : ''}`} />
                {rendering ? '렌더 중…' : 'Mixed 다운로드'}
              </button>
              {rendering && (
                <div className="text-[11px] text-fg-dim text-center">ffmpeg 합산 처리 중…</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
