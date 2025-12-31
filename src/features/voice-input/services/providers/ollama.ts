import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from '../types'

export class OllamaProvider implements TranscriptionProviderInterface {
  async transcribe(
    audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    const baseUrl = config.baseUrl || 'http://localhost:11434'
    const model = config.model || 'whisper'

    // Convert blob to base64
    const base64Audio = await this.blobToBase64(audioBlob)

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: `Transcribe this audio: ${base64Audio}`,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Ollama transcription failed: ${response.statusText}. Make sure Ollama is running and the model is installed.`
      )
    }

    const data = await response.json()
    return {
      text: data.response || '',
    }
  }

  async isAvailable(config: TranscriptionConfig): Promise<boolean> {
    try {
      const baseUrl = config.baseUrl || 'http://localhost:11434'
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      })
      return response.ok
    } catch {
      return false
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}
