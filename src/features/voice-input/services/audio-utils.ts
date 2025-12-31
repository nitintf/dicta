/**
 * Utility functions for audio processing
 */

/**
 * Convert MediaStream to Blob (WAV format)
 */
export async function streamToBlob(stream: MediaStream): Promise<Blob> {
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus',
  })

  return new Promise((resolve, reject) => {
    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      resolve(blob)
    }

    mediaRecorder.onerror = error => {
      reject(error)
    }

    // Record for a short duration to capture the stream
    // In practice, you'd want to record the entire stream
    mediaRecorder.start()

    // Stop after a minimal duration (this is a workaround)
    // In real implementation, you'd stop when user clicks stop
    setTimeout(() => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
    }, 100)
  })
}

/**
 * Convert MediaStream to Blob by recording until stream ends
 */
export async function captureStreamToBlob(
  stream: MediaStream,
  duration?: number
): Promise<Blob> {
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg',
  })

  return new Promise((resolve, reject) => {
    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType })
      resolve(blob)
    }

    mediaRecorder.onerror = error => {
      reject(error)
    }

    mediaRecorder.start()

    if (duration) {
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop()
        }
      }, duration)
    }
    // If no duration, caller must stop the recorder manually
  })
}

/**
 * Create a MediaRecorder that can be controlled externally
 */
export function createControllableRecorder(stream: MediaStream): {
  recorder: MediaRecorder
  getBlob: () => Promise<Blob>
} {
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg',
  })

  const chunks: Blob[] = []

  mediaRecorder.ondataavailable = event => {
    if (event.data.size > 0) {
      chunks.push(event.data)
    }
  }

  const getBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType })
          resolve(blob)
        }
        mediaRecorder.onerror = error => {
          reject(error)
        }
        mediaRecorder.stop()
      } else {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType })
        resolve(blob)
      }
    })
  }

  return { recorder: mediaRecorder, getBlob }
}

/**
 * Play audio feedback for recording actions
 */
export function playAudioFeedback(audioFile: 'main' | 'cancel'): void {
  try {
    const audio = new Audio(
      `/${audioFile === 'main' ? 'main.mp3' : 'cancel.wav'}`
    )
    audio.volume = 0.03 // Set volume to 3% for subtlety
    audio.play().catch(error => {
      console.error('Failed to play audio feedback:', error)
    })
  } catch (error) {
    console.error('Error creating audio feedback:', error)
  }
}
