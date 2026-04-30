import { useState, useEffect } from 'react'
import type { TrimSelection } from '../types'

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function useTrimSelection(durationSec: number) {
  const [startSec, setStart] = useState(0)
  const [endSec, setEnd] = useState(durationSec)

  useEffect(() => {
    setStart(0)
    setEnd(durationSec)
  }, [durationSec])

  function set(patch: Partial<TrimSelection>) {
    if (patch.startSec != null) {
      setStart(clamp(patch.startSec, 0, endSec - 0.05))
    }
    if (patch.endSec != null) {
      setEnd(clamp(patch.endSec, startSec + 0.05, durationSec))
    }
  }

  const isValid = startSec < endSec && endSec - startSec >= 1.0

  return { startSec, endSec, set, isValid }
}
