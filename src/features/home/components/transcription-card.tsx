import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { AudioPlayer } from '@/components/ui/audio-player'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { useAudioPath } from '@/features/transcriptions'
import { cn } from '@/lib/cn'

import { formatTime, formatDuration } from '../utils'

import type { Transcription } from '@/features/transcriptions'

interface TranscriptionCardProps {
  transcription: Transcription
  onDelete: (id: string) => void
  isLast: boolean
}

export function TranscriptionCard({
  transcription,
  onDelete,
  isLast,
}: TranscriptionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const timestamp = parseInt(transcription.id.split('-')[0])
  const { audioPath } = useAudioPath(timestamp)

  return (
    <div
      className={cn(
        'group hover:bg-muted/30 border-b border-border transition-colors',
        {
          'border-b-0': isLast,
        }
      )}
    >
      {/* Main content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground line-clamp-2 mb-2">
              {transcription.text}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{formatTime(transcription.timestamp)}</span>
              <span>{transcription.wordCount} words</span>
              <span>{formatDuration(transcription.duration ?? undefined)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {audioPath && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={
                  isExpanded ? 'Hide audio player' : 'Show audio player'
                }
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            <CopyButton
              content={transcription.text}
              size="icon"
              variant="ghost"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(transcription.id)}
              aria-label="Delete transcription"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable audio player */}
      {isExpanded && audioPath && (
        <div className="px-4 pb-4 pt-0">
          <AudioPlayer
            audioPath={audioPath}
            duration={transcription.duration ?? undefined}
          />
        </div>
      )}
    </div>
  )
}
