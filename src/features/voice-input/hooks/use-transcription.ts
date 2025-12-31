import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { useCallback, useState } from 'react'

import { captureStreamToBlob } from '../services/audio-utils'
import { transcriptionService } from '../services/transcription-service'

import type {
  TranscriptionConfig,
  TranscriptionResult,
} from '../services/types'

export function useTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState<string>('')
  const [error, setError] = useState<Error | null>(null)

  const transcribeFromBlob = useCallback(
    async (
      audioBlob: Blob,
      config: TranscriptionConfig
    ): Promise<TranscriptionResult | null> => {
      setIsTranscribing(true)
      setError(null)

      try {
        const result = await transcriptionService.transcribe(audioBlob, config)

        setTranscript(result.text)

        // Insert text (copy to clipboard or paste at cursor)
        void writeText(result.text)

        return result
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Transcription failed')
        setError(error)
        console.error('Transcription error:', error)
        throw error
      } finally {
        setIsTranscribing(false)
      }
    },
    []
  )

  const transcribe = useCallback(
    async (
      stream: MediaStream,
      config: TranscriptionConfig
    ): Promise<TranscriptionResult | null> => {
      // This method is kept for backward compatibility
      // But it's better to use transcribeFromBlob with a pre-recorded blob
      return transcribeFromBlob(await captureStreamToBlob(stream), config)
    },
    [transcribeFromBlob]
  )

  return {
    transcribe,
    transcribeFromBlob,
    isTranscribing,
    transcript,
    error,
  }
}
