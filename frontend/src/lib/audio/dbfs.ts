/** Convert linear amplitude (0~1) to dBFS */
export function linToDb(lin: number): number {
  if (lin <= 0) return -Infinity
  return 20 * Math.log10(lin)
}

/** Convert dBFS to linear amplitude */
export function dbToLin(db: number): number {
  return Math.pow(10, db / 20)
}

/**
 * Compute RMS and Peak dBFS from an AudioBuffer.
 * Uses all channels, returns the maximum across channels.
 */
export function computeStats(buffer: AudioBuffer): { rms: number; peak: number } {
  let globalPeak = 0
  let globalSumSq = 0
  let totalSamples = 0

  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c)
    let sumSq = 0
    let peak = 0
    for (let i = 0; i < data.length; i++) {
      const v = Math.abs(data[i])
      if (v > peak) peak = v
      sumSq += v * v
    }
    if (peak > globalPeak) globalPeak = peak
    globalSumSq += sumSq
    totalSamples += data.length
  }

  const rmsLin = totalSamples > 0 ? Math.sqrt(globalSumSq / totalSamples) : 0
  return {
    rms: linToDb(rmsLin),
    peak: linToDb(globalPeak),
  }
}

/**
 * Map dBFS value to a 0~1 meter percentage.
 * -48 dBFS → 0%, 0 dBFS → 100%
 */
export function dbToPct(db: number, floor = -48): number {
  if (!isFinite(db)) return 0
  return Math.max(0, Math.min(1, (db - floor) / (0 - floor)))
}
