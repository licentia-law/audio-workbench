/**
 * useStemMixer
 * Web Audio API: 4 GainNode + 1 masterGain + AnalyserNode
 * tracks 변경 시 AudioContext 재초기화, mixerState 변경 시 GainNode 값 즉시 업데이트.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { dbToGain } from '../lib/audio/dbfs'
import { STEM_IDS } from './useStemSeparation'
import type { StemId, StemTrack, MixerState } from '../types'

interface UseStemMixerReturn {
  isPlaying: boolean
  positionSec: number
  durationSec: number
  level: number          // 0~1 linear (master analyser peak)
  buffersReady: boolean
  play: () => void
  stop: () => void
  seekTo: (sec: number) => void
}

export function useStemMixer(
  tracks: Record<StemId, StemTrack> | null,
  mixerState: MixerState,
): UseStemMixerReturn {
  // ── Web Audio refs ────────────────────────────────────────────────────────
  const ctxRef       = useRef<AudioContext | null>(null)
  const gainNodesRef = useRef<Partial<Record<StemId, GainNode>>>({})
  const masterRef    = useRef<GainNode | null>(null)
  const analyserRef  = useRef<AnalyserNode | null>(null)
  const buffersRef   = useRef<Partial<Record<StemId, AudioBuffer>>>({})
  const sourcesRef   = useRef<Partial<Record<StemId, AudioBufferSourceNode>>>({})

  // ── Playback state ────────────────────────────────────────────────────────
  const [isPlaying,    setIsPlaying]    = useState(false)
  const [positionSec,  setPositionSec]  = useState(0)
  const [level,        setLevel]        = useState(0)
  const [buffersReady, setBuffersReady] = useState(false)

  const startCtxTimeRef = useRef(0)
  const seekOffsetRef   = useRef(0)
  const rafRef          = useRef<number>(0)

  const durationSec = tracks
    ? Math.max(...STEM_IDS.map(id => tracks[id]?.durationSec ?? 0))
    : 0

  // ── AudioContext 초기화 + 버퍼 디코딩 (tracks 변경 시) ─────────────────
  useEffect(() => {
    if (!tracks) return

    // 기존 컨텍스트 정리
    ctxRef.current?.close()
    gainNodesRef.current = {}
    buffersRef.current   = {}
    sourcesRef.current   = {}
    setBuffersReady(false)
    setIsPlaying(false)
    seekOffsetRef.current   = 0
    setPositionSec(0)

    const ctx = new AudioContext()
    ctxRef.current = ctx

    const master = ctx.createGain()
    masterRef.current = master
    master.gain.value = dbToGain(mixerState.masterDb)

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyserRef.current = analyser

    master.connect(analyser)
    analyser.connect(ctx.destination)

    STEM_IDS.forEach(id => {
      const g = ctx.createGain()
      gainNodesRef.current[id] = g
      g.connect(master)
    })

    // 모든 스템 ArrayBuffer → AudioBuffer 디코딩
    let cancelled = false
    Promise.all(
      STEM_IDS.map(async id => {
        const blob = tracks[id]?.blob
        if (!blob) return
        const ab = await blob.arrayBuffer()
        const decoded = await ctx.decodeAudioData(ab)
        buffersRef.current[id] = decoded
      })
    ).then(() => {
      if (!cancelled) setBuffersReady(true)
    }).catch(() => {
      // 디코딩 실패 시 silent fail (재생 버튼만 비활성화됨)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      Object.values(sourcesRef.current).forEach(s => { try { s?.stop() } catch {} })
      ctx.close()
    }
    // mixerState를 deps에서 제외 — 초기화 시에만 master gain 설정, 이후는 별도 effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks])

  // ── mixerState 변경 → GainNode 즉시 업데이트 ───────────────────────────
  useEffect(() => {
    const ctx = ctxRef.current
    if (!ctx) return

    const anySolo = STEM_IDS.some(id => mixerState.channels[id].solo)

    STEM_IDS.forEach(id => {
      const g = gainNodesRef.current[id]
      if (!g) return
      const { gainDb, muted, solo } = mixerState.channels[id]
      const effective = (muted || (anySolo && !solo)) ? 0 : dbToGain(gainDb)
      g.gain.setTargetAtTime(effective, ctx.currentTime, 0.01)
    })

    if (masterRef.current) {
      masterRef.current.gain.setTargetAtTime(
        dbToGain(mixerState.masterDb),
        ctx.currentTime,
        0.01,
      )
    }
  }, [mixerState])

  // ── play ─────────────────────────────────────────────────────────────────
  const play = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx || !buffersReady) return

    ctx.resume()

    // 기존 소스 중지
    Object.values(sourcesRef.current).forEach(s => { try { s?.stop() } catch {} })
    sourcesRef.current = {}
    cancelAnimationFrame(rafRef.current)

    const offset = seekOffsetRef.current
    startCtxTimeRef.current = ctx.currentTime

    STEM_IDS.forEach(id => {
      const buf = buffersRef.current[id]
      const gn  = gainNodesRef.current[id]
      if (!buf || !gn) return
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(gn)
      src.start(0, offset)
      sourcesRef.current[id] = src
    })

    setIsPlaying(true)

    // AnimationFrame 루프 — position + level meter
    const tick = () => {
      const elapsed = ctx.currentTime - startCtxTimeRef.current
      const pos = offset + elapsed

      if (pos >= durationSec) {
        // 자연 종료
        Object.values(sourcesRef.current).forEach(s => { try { s?.stop() } catch {} })
        sourcesRef.current = {}
        seekOffsetRef.current = 0
        setPositionSec(0)
        setIsPlaying(false)
        setLevel(0)
        return
      }

      setPositionSec(pos)

      // 레벨 미터
      const analyser = analyserRef.current
      if (analyser) {
        const data = new Float32Array(analyser.fftSize)
        analyser.getFloatTimeDomainData(data)
        let peak = 0
        for (let i = 0; i < data.length; i++) {
          const v = Math.abs(data[i])
          if (v > peak) peak = v
        }
        setLevel(Math.min(peak, 1))
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  // durationSec은 tracks 변경 시에만 변하므로 stable. buffersReady 의존 필요.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buffersReady, durationSec])

  // ── stop ─────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    // 현재 위치 보존
    const ctx = ctxRef.current
    if (ctx) {
      const elapsed = ctx.currentTime - startCtxTimeRef.current
      seekOffsetRef.current = Math.min(seekOffsetRef.current + elapsed, durationSec)
    }
    Object.values(sourcesRef.current).forEach(s => { try { s?.stop() } catch {} })
    sourcesRef.current = {}
    setIsPlaying(false)
    setLevel(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSec])

  // ── seekTo ────────────────────────────────────────────────────────────────
  const seekTo = useCallback((sec: number) => {
    seekOffsetRef.current = Math.max(0, Math.min(sec, durationSec))
    setPositionSec(seekOffsetRef.current)
    if (isPlaying) play()
  }, [isPlaying, play, durationSec])

  return { isPlaying, positionSec, durationSec, level, buffersReady, play, stop, seekTo }
}
