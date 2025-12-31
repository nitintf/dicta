import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from '../types'

export class DeepgramProvider implements TranscriptionProviderInterface {
  async transcribe(
    audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.wav')

    const params = new URLSearchParams()
    if (config.model) params.append('model', config.model)
    if (config.language) params.append('language', config.language)

    const response = await fetch(
      `https://api.deepgram.com/v1/listen?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${config.apiKey || ''}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Deepgram transcription failed: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    const text =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''

    return {
      text,
      language: data.results?.channels?.[0]?.alternatives?.[0]?.language,
      confidence: data.results?.channels?.[0]?.alternatives?.[0]?.confidence,
      segments: data.results?.channels?.[0]?.alternatives?.[0]?.words?.map(
        (word: { start: number; end: number; word: string }) => ({
          start: word.start,
          end: word.end,
          text: word.word,
        })
      ),
    }
  }

  async isAvailable(config: TranscriptionConfig): Promise<boolean> {
    return !!config.apiKey
  }
}
