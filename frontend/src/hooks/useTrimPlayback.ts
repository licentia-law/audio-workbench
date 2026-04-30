import { useState, useEffect, useRef } from 'react'

export function useTrimPlayback(audioSrc: string | undefined) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentSec, setCurrentSec] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.75)
  const stopAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (!audioSrc) {
      audioRef.current?.pause()
      audioRef.current = null
      setCurrentSec(0)
      setIsPlaying(false)
      return
    }

    const a = new Audio(audioSrc)
    a.volume = volume
    audioRef.current = a

    a.ontimeupdate = () => {
      setCurrentSec(a.currentTime)
      if (stopAtRef.current != null && a.currentTime >= stopAtRef.current) {
        a.pause()
        stopAtRef.current = null
      }
    }
    a.onpause = () => setIsPlaying(false)
    a.onplay = () => setIsPlaying(true)
    a.onended = () => {
      setIsPlaying(false)
      stopAtRef.current = null
    }

    return () => {
      a.pause()
      a.src = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc])

  return {
    currentSec,
    isPlaying,
    volume,
    playFrom(from: number, until?: number) {
      const a = audioRef.current
      if (!a) return
      a.currentTime = from
      stopAtRef.current = until ?? null
      a.play().catch(() => {})
    },
    stop() {
      audioRef.current?.pause()
      stopAtRef.current = null
    },
    seek(t: number) {
      const a = audioRef.current
      if (a) a.currentTime = t
    },
    setVolume(v: number) {
      const clamped = Math.max(0, Math.min(1, v))
      setVolumeState(clamped)
      const a = audioRef.current
      if (a) a.volume = clamped
    },
  }
}
