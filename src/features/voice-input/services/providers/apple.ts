import { invoke } from '@tauri-apps/api/core'

import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from '../types'

interface AppleSpeechResult {
  text: string
  confidence?: number
}

export class AppleProvider implements TranscriptionProviderInterface {
  async transcribe(
    _audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    try {
      // TODO: Convert Blob to file and save to temp location
      // For now, using a placeholder path
      const tempPath = '/tmp/audio_temp.wav'

      const result = await invoke<AppleSpeechResult>(
        'transcribe_with_apple_speech',
        {
          audioPath: tempPath,
          language: config.language || 'en-US',
        }
      )

      return {
        text: result.text,
        confidence: result.confidence,
      }
    } catch (error) {
      throw new Error(
        `Apple Speech transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async isAvailable(_config: TranscriptionConfig): Promise<boolean> {
    // Apple Speech is always available on macOS
    return true
  }
}
