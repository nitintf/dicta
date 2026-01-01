import { getDateLabel } from './date-formatter'

import type { Transcription } from '@/features/transcriptions'

export interface GroupedTranscriptions {
  label: string
  date: string
  transcriptions: Transcription[]
}

/**
 * Groups transcriptions by date (Today, Yesterday, etc.)
 * Returns groups sorted by date (newest first)
 */
export function groupTranscriptionsByDate(
  transcriptions: Transcription[]
): GroupedTranscriptions[] {
  const groups = new Map<string, GroupedTranscriptions>()

  transcriptions.forEach(transcription => {
    const { label, date } = getDateLabel(transcription.timestamp)

    if (!groups.has(date)) {
      groups.set(date, { label, date, transcriptions: [] })
    }

    groups.get(date)!.transcriptions.push(transcription)
  })

  // Sort groups by date (newest first)
  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}
