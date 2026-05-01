import { useState } from 'react'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/** 반음(semitone) 조절 상태 관리. 범위: −12 ~ +12. */
export function useKeyShift(initial = 0) {
  const [semi, setSemi] = useState<number>(initial)

  function set(v: number) {
    setSemi(clamp(Math.round(v), -12, 12))
  }

  function reset() {
    setSemi(0)
  }

  return { semi, set, reset }
}
