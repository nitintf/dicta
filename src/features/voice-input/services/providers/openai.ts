import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from '../types'

export class OpenAIProvider implements TranscriptionProviderInterface {
  async transcribe(
    audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.wav')
    formData.append('model', config.model || 'whisper-1')
    if (config.language) {
      formData.append('language', config.language)
    }
    if (config.temperature !== undefined) {
      formData.append('temperature', config.temperature.toString())
    }

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey || ''}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }))
      throw new Error(`OpenAI transcription failed: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return {
      text: data.text || '',
      language: data.language,
    }
  }

  async isAvailable(config: TranscriptionConfig): Promise<boolean> {
    return !!config.apiKey
  }
}
