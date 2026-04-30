import { useEffect, useRef, useState, useCallback } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface UseAudioPlayerReturn {
  isPlaying: boolean
  currentTime: number
  duration: number
  isReady: boolean
  play: () => void
  pause: () => void
  togglePlay: () => void
  seek: (sec: number) => void
}

export function useAudioPlayer(
  containerRef: React.RefObject<HTMLElement | null>,
  src?: string,
  peaks?: number[]
): UseAudioPlayerReturn {
  const wsRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !src) return

    setIsReady(false)
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4f46e5',
      progressColor: '#818cf8',
      cursorColor: '#c7d2fe',
      height: 64,
      normalize: true,
      interact: true,
    })

    wsRef.current = ws

    ws.on('play', () => setIsPlaying(true))
    ws.on('pause', () => setIsPlaying(false))
    ws.on('finish', () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })
    ws.on('timeupdate', (t) => setCurrentTime(t))
    ws.on('ready', (dur) => {
      setDuration(dur)
      setIsReady(true)
    })

    if (peaks && peaks.length > 0) {
      ws.load(src, [peaks])
    } else {
      ws.load(src)
    }

    return () => {
      ws.destroy()
      wsRef.current = null
    }
  }, [src]) // eslint-disable-line react-hooks/exhaustive-deps

  const play = useCallback(() => wsRef.current?.play(), [])
  const pause = useCallback(() => wsRef.current?.pause(), [])
  const togglePlay = useCallback(() => wsRef.current?.playPause(), [])
  const seek = useCallback((sec: number) => wsRef.current?.setTime(sec), [])

  return { isPlaying, currentTime, duration, isReady, play, pause, togglePlay, seek }
}
