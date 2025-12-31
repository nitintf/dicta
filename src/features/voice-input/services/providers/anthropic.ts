import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from '../types'

export class AnthropicProvider implements TranscriptionProviderInterface {
  async transcribe(
    _audioBlob: Blob,
    _config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    // Anthropic doesn't have direct audio transcription API yet
    // This would need to convert audio to text first or use a different approach
    throw new Error('Anthropic audio transcription not yet supported')
  }

  async isAvailable(config: TranscriptionConfig): Promise<boolean> {
    return !!config.apiKey
  }
}
