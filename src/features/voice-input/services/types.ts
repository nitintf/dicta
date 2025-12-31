export type TranscriptionProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'azure'
  | 'ollama'
  | 'lm-studio'
  | 'local-whisper'
  | 'huggingface'
  | 'deepgram'
  | 'assemblyai'

export interface TranscriptionConfig {
  provider: TranscriptionProvider
  model?: string
  apiKey?: string
  baseUrl?: string
  language?: string
  temperature?: number
  // Provider-specific options
  [key: string]: unknown
}

export interface TranscriptionResult {
  text: string
  language?: string
  confidence?: number
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
}

export interface TranscriptionProviderInterface {
  transcribe(
    audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult>
  isAvailable?(config: TranscriptionConfig): Promise<boolean>
}
