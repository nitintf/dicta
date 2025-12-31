import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from '../types'

export class AssemblyAIProvider implements TranscriptionProviderInterface {
  async transcribe(
    audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    // AssemblyAI requires uploading the file first, then polling for results
    // For simplicity, we'll use a direct upload approach
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        authorization: config.apiKey || '',
      },
      body: audioBlob,
    })

    if (!uploadResponse.ok) {
      throw new Error('AssemblyAI upload failed')
    }

    const { upload_url } = await uploadResponse.json()

    const transcriptResponse = await fetch(
      'https://api.assemblyai.com/v2/transcript',
      {
        method: 'POST',
        headers: {
          authorization: config.apiKey || '',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: upload_url,
          language_code: config.language || 'en',
        }),
      }
    )

    if (!transcriptResponse.ok) {
      throw new Error('AssemblyAI transcription request failed')
    }

    const { id } = await transcriptResponse.json()

    // Poll for results
    let result
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds

      const statusResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${id}`,
        {
          headers: {
            authorization: config.apiKey || '',
          },
        }
      )

      result = await statusResponse.json()

      if (result.status === 'completed') {
        break
      }

      if (result.status === 'error') {
        throw new Error(`AssemblyAI transcription failed: ${result.error}`)
      }

      attempts++
    }

    if (result.status !== 'completed') {
      throw new Error('AssemblyAI transcription timed out')
    }

    return {
      text: result.text || '',
      language: result.language_code,
      confidence: result.confidence,
      segments: result.words?.map(
        (word: { start: number; end: number; text: string }) => ({
          start: word.start / 1000, // Convert ms to seconds
          end: word.end / 1000,
          text: word.text,
        })
      ),
    }
  }

  async isAvailable(config: TranscriptionConfig): Promise<boolean> {
    return !!config.apiKey
  }
}
