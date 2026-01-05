import { TranscriptionCard } from './transcription-card'

import type { GroupedTranscriptions } from '../utils'

interface TranscriptionGroupProps {
  group: GroupedTranscriptions
  onDeleteTranscription: (id: string) => void
}

export function TranscriptionGroup({
  group,
  onDeleteTranscription,
}: TranscriptionGroupProps) {
  return (
    <div>
      <div className="sticky top-[42px] bg-background z-10 pb-3 pt-1">
        <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-background overflow-hidden">
        {group.transcriptions.map((transcription, index) => (
          <TranscriptionCard
            key={transcription.id}
            transcription={transcription}
            onDelete={onDeleteTranscription}
            isLast={index === group.transcriptions.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
