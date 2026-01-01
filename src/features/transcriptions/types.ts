export interface Transcription {
  id: string
  text: string
  audioBlob?: Blob
  audioUrl?: string // For playback
  duration?: number // in seconds
  timestamp: number // Unix timestamp
  wordCount: number
}

export interface TranscriptionsState {
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
