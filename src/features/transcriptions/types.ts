import type { Transcription } from './schema'

export type { Transcription }

export interface TranscriptionsStore {
  transcriptions: Transcription[]
  initialized: boolean
  initialize: () => Promise<void>
  addTranscription: (
    transcription: Omit<Transcription, 'id' | 'wordCount'>
  ) => Promise<Transcription>
  deleteTranscription: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  getStats: () => {
    totalTranscriptions: number
    totalWords: number
    todayCount: number
  }
}
