import { useState, useRef } from 'react'
import { apiService } from '../services/api'
import type { AnalysisStep, AnalysisResult, StepKey } from '../types'

const STEP_DEFS: { key: StepKey; label: string; weight: number }[] = [
  { key: 'decode',   label: '디코딩',           weight: 0.10 },
  { key: 'peaks',    label: '피크 추출',         weight: 0.20 },
  { key: 'key',      label: 'Key 추정 (chroma)', weight: 0.40 },
  { key: 'bpm',      label: 'BPM 추정 (onset)',  weight: 0.25 },
  { key: 'loudness', label: '음량 (RMS / Peak)', weight: 0.05 },
]

function makeIdleSteps(): AnalysisStep[] {
  return STEP_DEFS.map((s) => ({ key: s.key, label: s.label, status: 'idle', progress: 0 }))
}

export function useAnalysisJob() {
  const [steps, setSteps] = useState<AnalysisStep[]>(makeIdleSteps)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function reset() {
    stopTimer()
    setSteps(makeIdleSteps())
    setResult(null)
  }

  async function run(fileId: string): Promise<AnalysisResult> {
    reset()

    // 시뮬레이션: 전체 progress를 0→0.95로 서서히 올린다
    let simProgress = 0
    const TICK_MS = 80
    const TOTAL_MS = 5000 // 예상 분석 시간 5초 기준으로 시뮬레이션
    const incrementPerTick = 0.95 / (TOTAL_MS / TICK_MS)

    timerRef.current = setInterval(() => {
      simProgress = Math.min(0.95, simProgress + incrementPerTick)
      setSteps(computeSteps(simProgress))
    }, TICK_MS)

    try {
      const res = await apiService.analyze(fileId)
      stopTimer()
      // 완료: 모든 단계 done
      setSteps(STEP_DEFS.map((s) => ({ key: s.key, label: s.label, status: 'done', progress: 1 })))
      setResult(res)
      return res
    } catch (err) {
      stopTimer()
      // 마지막 active 단계를 error로 표시
      setSteps((prev) => {
        const copy = [...prev]
        const lastActive = [...copy].reverse().findIndex((s) => s.status === 'active' || s.status === 'done')
        if (lastActive >= 0) {
          const idx = copy.length - 1 - lastActive
          copy[idx] = { ...copy[idx], status: 'error', progress: 0 }
        }
        return copy
      })
      throw err
    }
  }

  const overallProgress = steps.reduce((acc, s) => {
    const def = STEP_DEFS.find((d) => d.key === s.key)
    const w = def?.weight ?? 0
    if (s.status === 'done') return acc + w
    if (s.status === 'active') return acc + w * (s.progress ?? 0)
    return acc
  }, 0)

  return { steps, result, overallProgress, run, reset }
}

// overall progress(0..1)를 단계별 status/progress로 변환
function computeSteps(overall: number): AnalysisStep[] {
  let acc = 0
  return STEP_DEFS.map((s) => {
    const start = acc
    const end = acc + s.weight
    acc = end
    let status: AnalysisStep['status'] = 'idle'
    let progress = 0
    if (overall >= end) {
      status = 'done'; progress = 1
    } else if (overall > start) {
      status = 'active'; progress = (overall - start) / s.weight
    }
    return { key: s.key, label: s.label, status, progress }
  })
}
