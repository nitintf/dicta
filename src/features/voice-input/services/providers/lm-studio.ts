import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from '../types'

export class LMStudioProvider implements TranscriptionProviderInterface {
  async transcribe(
    audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    const baseUrl = config.baseUrl || 'http://localhost:1234'
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.wav')
    formData.append('model', config.model || 'whisper')

    const response = await fetch(`${baseUrl}/v1/audio/transcriptions`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(
        `LM Studio transcription failed: ${response.statusText}. Make sure LM Studio is running with the API server enabled.`
      )
    }

    const data = await response.json()
    return {
      text: data.text || '',
      language: data.language,
    }
  }

  async isAvailable(config: TranscriptionConfig): Promise<boolean> {
    try {
      const baseUrl = config.baseUrl || 'http://localhost:1234'
      const response = await fetch(`${baseUrl}/v1/models`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      })
      return response.ok
    } catch {
      return false
    }
  }
}
