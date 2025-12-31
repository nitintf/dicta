import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from '../types'

export class GoogleProvider implements TranscriptionProviderInterface {
  async transcribe(
    audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    // Convert blob to base64
    const base64Audio = await this.blobToBase64(audioBlob)

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: config.language || 'en-US',
            model: config.model || 'default',
          },
          audio: {
            content: base64Audio.split(',')[1], // Remove data:audio/wav;base64, prefix
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Google transcription failed: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    const text = data.results?.[0]?.alternatives?.[0]?.transcript || ''

    return {
      text,
      language: config.language,
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

  async isAvailable(config: TranscriptionConfig): Promise<boolean> {
    return !!config.apiKey
  }
}
