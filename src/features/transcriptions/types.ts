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
  addTranscription: (
    transcription: Omit<Transcription, 'id' | 'wordCount'>
  ) => Transcription
  deleteTranscription: (id: string) => void
  clearAll: () => void
  getStats: () => {
    totalTranscriptions: number
    totalWords: number
    todayCount: number
  }
}
