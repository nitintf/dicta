import { useState } from 'react'

import { LiveWaveform } from '@/components/ui/live-waveform'
import { useAudioRecording } from '@/hooks/use-audio-recording'
import { useTauriEvent } from '@/hooks/use-tauri-event'

import { CancelButton } from './cancel-button'
import { StopButton } from './stop-button'
import { VoiceInputContainer } from './voice-input-container'

export const VoiceInput = () => {
  const recording = useAudioRecording()
  const [audioLevel, setAudioLevel] = useState<number>(0)

  const isTranscribing = recording.state === 'transcribing'
  const isProcessing = recording.state === 'stopping' || isTranscribing

  // Listen for audio levels from backend
  useTauriEvent<number>('audio-level', event => {
    setAudioLevel(event.payload)
  })

  // Note: Escape key is now handled globally by the backend shortcut system
  // See: src-tauri/src/features/shortcuts/manager.rs and recording_handler.rs

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
            audioLevel={audioLevel}
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
