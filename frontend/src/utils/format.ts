// ── 공통 포맷 헬퍼 ───────────────────────────────────────────────────────────
// 모든 파일 메타 / 분석 수치 표시에 사용하는 순수 함수들.
// CutPage, AnalyzePage, FileMetaCard 등에서 공통 import.

export function formatBytes(b: number): string {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(2)} MB`
}

export function formatDuration(s: number): string {
  const m = Math.floor(s / 60)
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
}

export function formatSampleRate(hz: number | null | undefined): string {
  if (!hz) return '—'
  return `${(hz / 1000).toFixed(1)} kHz`
}

export function formatBitrate(bps: number | null | undefined): string {
  if (!bps) return '—'
  return `${Math.round(bps / 1000)} kbps`
}

/** "+6" | "-3.5" | "0"  (부호 포함, 단위 없음) */
export function formatGainDbNum(db: number): string {
  const sign = db > 0 ? '+' : ''
  return sign + (db % 1 === 0 ? db.toFixed(0) : db.toFixed(1))
}

/** "+6 dB" | "-3.5 dB" | "0 dB" */
export function formatGainDb(db: number): string {
  return formatGainDbNum(db) + ' dB'
}
