import { useState, useEffect, useRef } from 'react'

export function useTrimPlayback(audioSrc: string | undefined) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentSec, setCurrentSec] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
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
  }, [audioSrc])

  return {
    currentSec,
    isPlaying,
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
  }
}
