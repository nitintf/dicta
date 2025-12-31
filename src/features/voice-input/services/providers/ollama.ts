import OpenAI from 'openai'

import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from '../types'

export class OllamaProvider implements TranscriptionProviderInterface {
  private getClient(baseUrl: string): OpenAI {
    return new OpenAI({
      apiKey: 'ollama', // Ollama doesn't require an API key
      baseURL: `${baseUrl}/v1`,
      dangerouslyAllowBrowser: true,
    })
  }

  async transcribe(
    audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    const baseUrl = config.baseUrl || 'http://localhost:11434'
    const client = this.getClient(baseUrl)

    // Convert Blob to File
    const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' })

    try {
      const transcription = await client.audio.transcriptions.create({
        file: audioFile,
        model: config.model || 'whisper',
        language: config.language,
        temperature: config.temperature,
        response_format: 'verbose_json',
      })

      return {
        text: transcription.text || '',
        language: transcription.language,
        segments: transcription.segments?.map(seg => ({
          start: seg.start,
          end: seg.end,
          text: seg.text,
        })),
      }
    } catch (error) {
      throw new Error(
        `Ollama transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure Ollama is running with OpenAI-compatible endpoint.`
      )
    }
  }

  async isAvailable(config: TranscriptionConfig): Promise<boolean> {
    try {
      const baseUrl = config.baseUrl || 'http://localhost:11434'
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}
