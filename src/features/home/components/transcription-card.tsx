import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
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
  return (
    <div
      className={cn(
        'group hover:bg-muted/30 p-4 border-b border-border transition-colors',
        {
          'border-b-0': isLast,
        }
      )}
    >
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
  )
}
