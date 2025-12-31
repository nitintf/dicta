import { invoke } from '@tauri-apps/api/core'

import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from '../types'

interface GoogleTranscriptionResponse {
  text: string
  language?: string
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
}

export class GoogleProvider implements TranscriptionProviderInterface {
  async transcribe(
    audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    if (!config.apiKey) {
      throw new Error('Google Cloud API key is required')
    }

    try {
      // Convert Blob to ArrayBuffer and then to Array
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioData = Array.from(new Uint8Array(arrayBuffer))

      const response = await invoke<GoogleTranscriptionResponse>(
        'transcribe_with_google',
        {
          audioData,
          apiKey: config.apiKey,
          language: config.language,
        }
      )

      return {
        text: response.text || '',
        language: response.language,
        segments: response.segments,
      }
    } catch (error) {
      throw new Error(
        `Google transcription failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async isAvailable(config: TranscriptionConfig): Promise<boolean> {
    return !!config.apiKey
  }
}
