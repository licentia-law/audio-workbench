/**
 * StemMiniWave
 * peaks 배열 기반 막대 파형.
 * 재생 진행 부분 = 채널 컬러 그라디언트 hot, 나머지 = dim.
 * muted 시 전체 회색조로 fade.
 */
interface StemMiniWaveProps {
  peaks: number[]
  color: string
  playing: boolean
  muted: boolean
  progress?: number   // 0~1 (재생 위치)
}

export function StemMiniWave({
  peaks,
  color,
  playing,
  muted,
  progress = 0,
}: StemMiniWaveProps) {
  const N = peaks.length
  const gradId = `sw-g-${color.replace('#', '')}`
  const clipId = `sw-cp-${color.replace('#', '')}`

  return (
    <svg
      viewBox={`0 0 ${N} 100`}
      preserveAspectRatio="none"
      className="w-full h-[64px]"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.95" />
          <stop offset="1" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={N * progress} height="100" />
        </clipPath>
      </defs>

      {/* dim 배경 파형 */}
      <g fill="#3A4670" opacity={muted ? 0.3 : 0.55}>
        {peaks.map((v, i) => (
          <rect key={i} x={i + 0.15} y={50 - v * 45} width={0.7} height={v * 90} rx="0.3" />
        ))}
      </g>

      {/* hot: 재생된 구간 */}
      {!muted && (
        <g fill={`url(#${gradId})`} clipPath={`url(#${clipId})`}>
          {peaks.map((v, i) => (
            <rect key={i} x={i + 0.15} y={50 - v * 45} width={0.7} height={v * 90} rx="0.3" />
          ))}
        </g>
      )}

      {/* 중앙 hairline */}
      <line x1="0" y1="50" x2={N} y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />

      {/* 재생 헤드 */}
      {playing && !muted && progress > 0 && (
        <line
          x1={N * progress} y1="0"
          x2={N * progress} y2="100"
          stroke="#FFB347"
          strokeWidth="0.7"
        />
      )}
    </svg>
  )
}
