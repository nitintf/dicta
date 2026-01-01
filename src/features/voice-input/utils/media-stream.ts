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
 * @param deviceId - Optional device ID to use for audio input (null = default device)
 */
export async function initializeMediaStream(
  deviceId?: string | null
): Promise<MediaStream> {
  // Check and request permission if needed
  console.log('Starting recording, checking microphone permission...')
  const hasMicPermission = await ensureMicPermission()
  console.log('Has mic permission:', hasMicPermission)

  if (!hasMicPermission) {
    console.error('Microphone permission not granted via Tauri plugin')
    console.log('Attempting direct getUserMedia call anyway...')
  }

  // Build audio constraints with optional device ID
  const audioConstraints = deviceId
    ? { ...AUDIO_CONSTRAINTS, deviceId: { exact: deviceId } }
    : AUDIO_CONSTRAINTS

  // Get microphone stream - try even if Tauri permission check failed
  // because the webview might have its own permission
  console.log('Calling getUserMedia with constraints:', audioConstraints)

  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
    })
    console.log('getUserMedia successful, got stream:', mediaStream)
    return mediaStream
  } catch (error) {
    // If device not found, fall back to default device
    if (
      deviceId &&
      error instanceof Error &&
      (error.name === 'NotFoundError' || error.name === 'OverconstrainedError')
    ) {
      console.warn(
        'Selected microphone device not found, falling back to default:',
        error
      )
      const fallbackStream = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONSTRAINTS,
      })
      console.log('Fallback getUserMedia successful')
      return fallbackStream
    }

    // Re-throw other errors
    throw error
  }
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
