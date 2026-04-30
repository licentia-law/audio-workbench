interface WaveformPanelProps {
  height?: number
  color?: string
  isEmpty?: boolean
}

export function WaveformPanel({ height = 64, isEmpty = false }: WaveformPanelProps) {
  return (
    <div className="rounded-xl bg-surface-raised border border-white/10 px-4 py-3">
      {isEmpty && (
        <div
          className="rounded bg-white/5 animate-pulse"
          style={{ height }}
        />
      )}
    </div>
  )
}
