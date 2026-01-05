import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

interface AudioPlayerProps {
  audioPath: string
  duration?: number
  className?: string
}

export function AudioPlayer({
  audioPath,
  duration,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)
  const [isReady, setIsReady] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setAudioDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleCanPlay = () => setIsReady(true)
    const handleLoadedData = () => {
      setIsReady(true)
      if (audio.duration) setAudioDuration(audio.duration)
    }
    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement
      setAudioError(target.error?.message || 'Failed to load audio')
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    queueMicrotask(() => {
      if (audio.readyState >= 2) {
        setIsReady(true)
        if (audio.duration) setAudioDuration(audio.duration)
      }
    })

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [audioPath])

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        await audio.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      setIsPlaying(false)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audioDuration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * audioDuration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (audioError) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-destructive text-xs',
          className
        )}
      >
        Error: {audioError}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-full bg-muted/60 border border-border/50',
        className
      )}
    >
      <audio ref={audioRef} src={audioPath} preload="auto" />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        disabled={!isReady}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full transition-all',
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5" fill="currentColor" />
        ) : (
          <Play className="h-3.5 w-3.5 ml-0.5" fill="currentColor" />
        )}
      </button>

      {/* Progress Section */}
      <div className="flex-1 flex items-center gap-3">
        {/* Current Time */}
        <span className="text-xs font-medium tabular-nums text-foreground min-w-[32px]">
          {formatTime(currentTime)}
        </span>

        {/* Progress Bar */}
        <div
          className="flex-1 h-1 rounded-full bg-foreground/10 cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-primary rounded-full relative transition-all"
            style={{ width: `${progress}%` }}
          >
            {/* Hover dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
          </div>
        </div>

        {/* Total Duration */}
        <span className="text-xs tabular-nums text-muted-foreground min-w-[32px]">
          {formatTime(audioDuration)}
        </span>
      </div>
    </div>
  )
}
