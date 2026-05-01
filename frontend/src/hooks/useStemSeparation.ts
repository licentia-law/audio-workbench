/**
 * useStemSeparation
 * POST /api/stems/separate 호출 → Blob 취득 → StemTrack 생성.
 * 진행도: setInterval 시뮬레이션 (P3 패턴 동일).
 */
import { useState, useRef, useEffect } from 'react'
import { apiService } from '../services/api'
import type { StemId, StemInfo, StemTrack } from '../types'

export type SeparationStatus = 'idle' | 'separating' | 'done' | 'error'

export const STEM_IDS: StemId[] = ['vocals', 'drums', 'bass', 'other']

/** 결정론적 미니 파형 생성 (디자인 시안 동일 알고리즘) */
function genStemPeaks(stemId: StemId, N = 220): number[] {
  let s = stemId.charCodeAt(0) * 7 + 11
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  const arr: number[] = []
  for (let i = 0; i < N; i++) {
    const t = i / N
    const env = 0.3 + 0.55 * Math.pow(Math.sin(t * Math.PI * 1.4), 0.7) + 0.2 * Math.sin(t * Math.PI * 5 + s)
    const noise = (rnd() - 0.5) * 0.5
    arr.push(Math.max(0.06, Math.min(1, env + noise)))
  }
  return arr
}

/** 믹스 파형: 4개 스템 peaks 평균 (StemMasterPanel용) */
export function genMixPeaks(N = 500): number[] {
  let s = 42
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  const arr: number[] = []
  for (let i = 0; i < N; i++) {
    const t = i / N
    const env =
      0.35 +
      0.50 * Math.pow(Math.sin(t * Math.PI), 0.6) +
      0.15 * Math.sin(t * Math.PI * 7) +
      (t > 0.52 && t < 0.60 ? -0.20 : 0) +
      (t > 0.88 ? -0.12 * (t - 0.88) * 8 : 0)
    const noise = (rnd() - 0.5) * 0.42
    arr.push(Math.max(0.06, Math.min(1, env + noise)))
  }
  return arr
}

interface UseStemSeparationReturn {
  status: SeparationStatus
  progress: number                           // 0~100
  stems: Record<StemId, StemInfo> | null
  tracks: Record<StemId, StemTrack> | null
  errorMsg: string | null
  separate: (fileId: string) => void
  reset: () => void
}

export function useStemSeparation(): UseStemSeparationReturn {
  const [status,   setStatus]   = useState<SeparationStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [stems,    setStems]    = useState<Record<StemId, StemInfo> | null>(null)
  const [tracks,   setTracks]   = useState<Record<StemId, StemTrack> | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 진행도 setInterval 핸들 + in-flight 작업 식별자.
  // operationId가 바뀌면 이전 in-flight 요청은 stale로 간주되어 결과 폐기.
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const operationIdRef = useRef(0)
  const tracksRef      = useRef<Record<StemId, StemTrack> | null>(null)

  // tracks 최신 ref 동기화 (언마운트 cleanup에서 stale closure 회피)
  useEffect(() => { tracksRef.current = tracks }, [tracks])

  function clearProgressInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function revokeTrackUrls(t: Record<StemId, StemTrack> | null) {
    if (t) Object.values(t).forEach(track => URL.revokeObjectURL(track.url))
  }

  function separate(fileId: string) {
    // 이전 in-flight 작업 무효화
    const myOpId = ++operationIdRef.current
    const isStale = () => operationIdRef.current !== myOpId

    // 기존 tracks 해제
    revokeTrackUrls(tracksRef.current)

    setStatus('separating')
    setProgress(0)
    setStems(null)
    setTracks(null)
    setErrorMsg(null)

    // 진행도 시뮬레이션: 매 1200ms +2%, 최대 92%
    clearProgressInterval()
    intervalRef.current = setInterval(() => {
      setProgress(p => Math.min(p + 2, 92))
    }, 1200)

    apiService.separateStems(fileId)
      .then(async (result) => {
        if (isStale()) return

        clearProgressInterval()
        setProgress(100)
        setStems(result.stems)

        // 각 스템 Blob 취득 + StemTrack 생성
        const entries = await Promise.all(
          STEM_IDS.map(async (id) => {
            const info = result.stems[id]
            const res = await fetch(`/api/download/${info.artifactId}`)
            if (!res.ok) throw new Error(`${id} blob fetch 실패`)
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const track: StemTrack = {
              id,
              blob,
              url,
              peaks: genStemPeaks(id),
              durationSec: info.durationSec,
            }
            return [id, track] as [StemId, StemTrack]
          })
        )

        if (isStale()) {
          // stale 결과: blob URL 즉시 해제 (메모리 누수 방지)
          entries.forEach(([, t]) => URL.revokeObjectURL(t.url))
          return
        }

        setTracks(Object.fromEntries(entries) as Record<StemId, StemTrack>)
        setStatus('done')
      })
      .catch((err) => {
        if (isStale()) return
        clearProgressInterval()
        setErrorMsg(err instanceof Error ? err.message : '스템 분리에 실패했습니다.')
        setStatus('error')
      })
  }

  function reset() {
    // in-flight 작업 무효화
    operationIdRef.current++
    clearProgressInterval()
    revokeTrackUrls(tracksRef.current)
    setStatus('idle')
    setProgress(0)
    setStems(null)
    setTracks(null)
    setErrorMsg(null)
  }

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      operationIdRef.current++
      clearProgressInterval()
      revokeTrackUrls(tracksRef.current)
    }
  }, [])

  return { status, progress, stems, tracks, errorMsg, separate, reset }
}
