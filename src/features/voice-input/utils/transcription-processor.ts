import { invoke } from '@tauri-apps/api/core'

import { convertToWav } from './audio-converter'

export interface TranscriptionRequest {
  audioBlob: Blob
  timestamp: number
  duration: number
}

/**
 * Processes audio transcription by:
 * 1. Converting audio to WAV format
 * 2. Invoking Rust backend for transcription
 * 3. Handling the complete flow (save, copy/paste, emit events)
 */
export async function processTranscription(
  request: TranscriptionRequest
): Promise<void> {
  const { audioBlob, timestamp, duration } = request

  // Convert audio to WAV format (required for Whisper models)
  // Browser MediaRecorder outputs WebM/Opus, but Whisper expects WAV PCM
  const wavBlob = await convertToWav(audioBlob)
  const audioData = new Uint8Array(await wavBlob.arrayBuffer())

  // Call unified Rust command that handles:
  // 1. Getting selected model
  // 2. Transcribing with appropriate provider
  // 3. Saving to transcription store
  // 4. Copy and paste
  // 5. Emitting events for UI updates
  await invoke('transcribe_and_process', {
    request: {
      audioData: Array.from(audioData),
      timestamp,
      duration,
    },
  })

  console.log('Transcription completed and processed')
}

/**
 * Calculates recording duration from start timestamp
 */
export function calculateDuration(startTime: number | null): number {
  if (!startTime) return 0
  return (Date.now() - startTime) / 1000
}
