/**
 * Converts an audio Blob to WAV format using Web Audio API
 * This is required because browser MediaRecorder outputs WebM/Opus,
 * but Whisper models expect WAV PCM format
 */
export async function convertToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer()
  const audioContext = new AudioContext({ sampleRate: 16000 })

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // Convert to mono if stereo
    const channels = audioBuffer.numberOfChannels
    const length = audioBuffer.length
    const sampleRate = audioBuffer.sampleRate

    // Get mono channel data
    let samples: Float32Array
    if (channels === 1) {
      samples = audioBuffer.getChannelData(0)
    } else {
      // Mix down to mono by averaging channels
      const left = audioBuffer.getChannelData(0)
      const right = audioBuffer.getChannelData(1)
      samples = new Float32Array(length)
      for (let i = 0; i < length; i++) {
        samples[i] = (left[i] + right[i]) / 2
      }
    }

    // Convert float32 samples to int16
    const int16Samples = new Int16Array(samples.length)
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]))
      int16Samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }

    // Create WAV file
    const wavBuffer = new ArrayBuffer(44 + int16Samples.length * 2)
    const view = new DataView(wavBuffer)

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + int16Samples.length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, 1, true) // mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true) // byte rate
    view.setUint16(32, 2, true) // block align
    view.setUint16(34, 16, true) // bits per sample
    writeString(36, 'data')
    view.setUint32(40, int16Samples.length * 2, true)

    // Write PCM data
    const dataView = new Int16Array(wavBuffer, 44)
    dataView.set(int16Samples)

    return new Blob([wavBuffer], { type: 'audio/wav' })
  } finally {
    await audioContext.close()
  }
}
