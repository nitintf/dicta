import { useEffect } from 'react'

import { LiveWaveform } from '@/components/ui/live-waveform'
import { useAudioRecording } from '@/hooks/use-audio-recording'

import { CancelButton } from './cancel-button'
import { StopButton } from './stop-button'
import { VoiceInputContainer } from './voice-input-container'

export const VoiceInput = () => {
  const recording = useAudioRecording()

  const isTranscribing = recording.state === 'transcribing'
  const isProcessing = recording.state === 'stopping' || isTranscribing

  // Handle escape key to cancel recording (local handler, not global)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Only cancel if we're in an active recording state
        const activeStates = [
          'recording',
          'starting',
          'stopping',
          'transcribing',
        ]
        if (activeStates.includes(recording.state)) {
          event.preventDefault()
          event.stopPropagation()
          recording.cancelRecording()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [recording])

  return (
    <VoiceInputContainer>
      <CancelButton
        onClick={recording.cancelRecording}
        disabled={isProcessing}
      />

      <div className="flex-1 flex items-center justify-center h-full">
        {isProcessing ? (
          <TranscriberProcessing />
        ) : (
          <LiveWaveform
            active={recording.isRecording}
            mode="static"
            barWidth={1.5}
            barGap={1.5}
            barRadius={5}
            barColor="#ffffff"
            height={20}
            sensitivity={1.5}
            fadeEdges
            fadeWidth={50}
            className="h-full w-full flex flex-1"
          />
        )}
      </div>

      <StopButton
        onClick={recording.stopRecording}
        isRecording={recording.isRecording}
        isProcessing={isProcessing}
      />
    </VoiceInputContainer>
  )
}

const TranscriberProcessing = () => {
  return (
    <LiveWaveform
      active={false}
      processing
      barWidth={1.5}
      barGap={1}
      barRadius={4}
      barColor="#9ca3af"
      fadeEdges
      fadeWidth={20}
      height={16}
      className="w-full opacity-70"
    />
  )
}
