// ── keyName.ts ────────────────────────────────────────────────────────────────
// Key 관련 유틸리티. tonic 문자열 → index 변환 + 반음 전조 계산.
// KeyShiftPage에서만 사용.

const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const TONIC_IDX: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3,
  E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8,
  Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
}

/** tonic 문자열 ('A', 'C#', 'Bb' 등) → 0..11 인덱스. 인식 불가 시 null. */
export function tonicToIdx(tonic: string | null | undefined): number | null {
  if (!tonic) return null
  return TONIC_IDX[tonic] ?? null
}

/** 반음 전조 계산. rootIdx/mode 중 하나라도 null이면 null 반환. */
export function transposeKey(
  rootIdx: number | null,
  mode: 'major' | 'minor' | null,
  semi: number,
): { display: string; fileSafe: string } | null {
  if (rootIdx == null || mode == null) return null
  const idx = ((rootIdx + semi) % 12 + 12) % 12
  const note = (semi < 0 ? FLAT : SHARP)[idx]
  const modeLabel = mode === 'minor' ? 'minor' : 'Major'
  return {
    display: `${note} ${modeLabel}`,
    fileSafe: `${note.replace('#', '_sharp').replace('b', '_flat')}_${modeLabel}`,
  }
}
