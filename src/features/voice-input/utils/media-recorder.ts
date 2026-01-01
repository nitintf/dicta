/**
 * Stops the MediaRecorder and returns the recorded audio as a Blob
 * Handles all event listeners and cleanup
 */
export async function stopMediaRecorder(
  recorder: MediaRecorder
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const chunks: Blob[] = []

    const handleDataAvailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    const handleStop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType })
      resolve(blob)
    }

    const handleError = (error: Event) => {
      reject(error)
    }

    recorder.addEventListener('dataavailable', handleDataAvailable)
    recorder.addEventListener('stop', handleStop, { once: true })
    recorder.addEventListener('error', handleError, { once: true })

    recorder.stop()
  })
}

/**
 * Safely stops and cleans up a MediaRecorder
 */
export function cleanupMediaRecorder(recorder: MediaRecorder | null): void {
  if (recorder && recorder.state === 'recording') {
    recorder.stop()
  }
}
