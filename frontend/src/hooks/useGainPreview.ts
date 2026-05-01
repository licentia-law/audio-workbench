/**
 * useGainPreview
 * Loads an audio blob into Web Audio, applies a real-time GainNode,
 * and drives a LED-meter via AnimationFrame.
 *
 * gainDb 상태는 페이지 컴포넌트가 소유 — 훅은 setGainDb(db) 메서드만 제공.
 * originalPeakLin: 디코딩 후 계산한 원본 peak 선형값 (willClip 정확 판정용).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { dbToLin, computeStats } from '../lib/audio/dbfs'

interface GainPreview {
  isLoaded: boolean
  isPlaying: boolean
  level: number             // 0~1 peak amplitude for meter (AnimationFrame 갱신)
  originalPeakLin: number   // 원본 오디오 peak 선형값 (0~1), willClip 판정용
  setGainDb: (db: number) => void
  play: () => void
  stop: () => void
}

export function useGainPreview(blob: Blob | null): GainPreview {
  const ctxRef      = useRef<AudioContext | null>(null)
  const bufferRef   = useRef<AudioBuffer | null>(null)
  const gainRef     = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef   = useRef<AudioBufferSourceNode | null>(null)
  const rafRef      = useRef<number>(0)
  const floatDataRef = useRef<Float32Array<ArrayBuffer>>(new Float32Array(1024))

  const [isLoaded, setIsLoaded]               = useState(false)
  const [isPlaying, setIsPlaying]             = useState(false)
  const [level, setLevel]                     = useState(0)
  const [originalPeakLin, setOriginalPeakLin] = useState(0)

  // Load blob → AudioBuffer → GainNode + AnalyserNode 체인 구성
  useEffect(() => {
    if (!blob) {
      setIsLoaded(false)
      setOriginalPeakLin(0)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const arrayBuffer = await blob.arrayBuffer()
        const ctx = new AudioContext()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

        if (cancelled) {
          ctx.close()
          return
        }

        // 기존 컨텍스트 해제
        if (ctxRef.current) {
          try { ctxRef.current.close() } catch { /* ignore */ }
        }

        const gain = ctx.createGain()
        gain.gain.value = 1.0

        const analyser = ctx.createAnalyser()
        analyser.fftSize = 1024
        analyser.smoothingTimeConstant = 0.8

        gain.connect(analyser)
        analyser.connect(ctx.destination)

        ctxRef.current    = ctx
        bufferRef.current = audioBuffer
        gainRef.current   = gain
        analyserRef.current = analyser
        floatDataRef.current = new Float32Array(analyser.fftSize)

        // 원본 peak 측정 — willClip 정확 판정용
        const stats = computeStats(audioBuffer)
        setOriginalPeakLin(isFinite(stats.peak) ? dbToLin(stats.peak) : 0)

        setIsLoaded(true)
      } catch {
        setIsLoaded(false)
        setOriginalPeakLin(0)
      }
    }

    load()
    return () => { cancelled = true }
  }, [blob])

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (sourceRef.current) {
        try { sourceRef.current.stop() } catch { /* ignore */ }
      }
      if (ctxRef.current) {
        try { ctxRef.current.close() } catch { /* ignore */ }
      }
    }
  }, [])

  /** GainNode gain 즉시 반영. gainDb 상태는 페이지 컴포넌트가 관리. */
  const setGainDb = useCallback((db: number) => {
    if (gainRef.current) {
      gainRef.current.gain.value = dbToLin(db)
    }
  }, [])

  const tickMeter = useCallback(() => {
    if (!analyserRef.current) return
    analyserRef.current.getFloatTimeDomainData(floatDataRef.current)
    let peak = 0
    for (let i = 0; i < floatDataRef.current.length; i++) {
      const v = Math.abs(floatDataRef.current[i])
      if (v > peak) peak = v
    }
    setLevel(peak)
    rafRef.current = requestAnimationFrame(tickMeter)
  }, [])

  const play = useCallback(() => {
    if (!ctxRef.current || !bufferRef.current || !gainRef.current) return

    if (sourceRef.current) {
      try { sourceRef.current.stop() } catch { /* ignore */ }
      sourceRef.current.disconnect()
    }

    const source = ctxRef.current.createBufferSource()
    source.buffer = bufferRef.current
    source.connect(gainRef.current)
    source.start()
    source.onended = () => {
      setIsPlaying(false)
      cancelAnimationFrame(rafRef.current)
      setLevel(0)
    }
    sourceRef.current = source
    setIsPlaying(true)

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tickMeter)
  }, [tickMeter])

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop() } catch { /* ignore */ }
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    cancelAnimationFrame(rafRef.current)
    setIsPlaying(false)
    setLevel(0)
  }, [])

  return { isLoaded, isPlaying, level, originalPeakLin, setGainDb, play, stop }
}
