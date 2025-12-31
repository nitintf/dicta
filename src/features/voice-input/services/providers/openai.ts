import { invoke } from '@tauri-apps/api/core'

import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from '../types'

interface OpenAITranscriptionResponse {
  text: string
  language?: string
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
}

export class OpenAIProvider implements TranscriptionProviderInterface {
  async transcribe(
    audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required')
    }

    try {
      // Convert Blob to ArrayBuffer and then to Array
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioData = Array.from(new Uint8Array(arrayBuffer))

      const response = await invoke<OpenAITranscriptionResponse>(
        'transcribe_with_openai',
        {
          audioData,
          apiKey: config.apiKey,
          model: config.model || 'whisper-1',
          language: config.language,
          temperature: config.temperature,
        }
      )

      return {
        text: response.text || '',
        language: response.language,
        segments: response.segments,
      }
    } catch (error) {
      throw new Error(
        `OpenAI transcription failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async isAvailable(config: TranscriptionConfig): Promise<boolean> {
    return !!config.apiKey
  }
}
