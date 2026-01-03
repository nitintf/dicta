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

      <div className="space-y-2 mb-6">
        {group.transcriptions.map(transcription => (
          <TranscriptionCard
            key={transcription.id}
            transcription={transcription}
            onDelete={onDeleteTranscription}
          />
        ))}
      </div>
    </div>
  )
}
