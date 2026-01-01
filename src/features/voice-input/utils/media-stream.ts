import { ensureMicPermission } from '@/lib/microphone-permissions'

/**
 * Audio constraints for media recording
 */
const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
} as const

/**
 * Initializes media stream with microphone access
 * Handles permission checking and getUserMedia
 */
export async function initializeMediaStream(): Promise<MediaStream> {
  // Check and request permission if needed
  console.log('Starting recording, checking microphone permission...')
  const hasMicPermission = await ensureMicPermission()
  console.log('Has mic permission:', hasMicPermission)

  if (!hasMicPermission) {
    console.error('Microphone permission not granted via Tauri plugin')
    console.log('Attempting direct getUserMedia call anyway...')
  }

  // Get microphone stream - try even if Tauri permission check failed
  // because the webview might have its own permission
  console.log('Calling getUserMedia...')
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: AUDIO_CONSTRAINTS,
  })
  console.log('getUserMedia successful, got stream:', mediaStream)

  return mediaStream
}

/**
 * Cleans up media stream by stopping all tracks
 */
export function cleanupMediaStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
}

/**
 * Creates an AudioContext for audio processing
 */
export function createAudioContext(): AudioContext {
  const AudioContextConstructor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext

  return new AudioContextConstructor()
}

/**
 * Cleans up AudioContext by closing it
 */
export function cleanupAudioContext(context: AudioContext | null): void {
  if (context && context.state !== 'closed') {
    context.close()
  }
}
