import { forwardRef, useEffect, useImperativeHandle } from 'react'

import { LiveWaveform } from '@/components/ui/live-waveform'

import { CancelButton } from './cancel-button'
import { StopButton } from './stop-button'
import { VoiceInputContainer } from './voice-input-container'
import { useTauriEvent } from '../../../hooks/use-tauri-event'
import { useVoiceRecording } from '../hooks/use-voice-recording'

export interface VoiceInputHandle {
  start: () => Promise<void>
  stop: () => Promise<void>
  cancel: () => Promise<void>
}

export const VoiceInput = forwardRef<VoiceInputHandle>((_props, ref) => {
  const {
    isRecording,
    isProcessing,
    stream,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecording()

  useImperativeHandle(
    ref,
    () => ({
      start: startRecording,
      stop: stopRecording,
      cancel: cancelRecording,
    }),
    [startRecording, stopRecording, cancelRecording]
  )

  useTauriEvent<void>(
    'stop_recording',
    () => {
      if (isRecording) {
        stopRecording()
      }
    },
    [isRecording, stopRecording]
  )

  useTauriEvent<void>(
    'cancel_recording',
    () => {
      if (isRecording) {
        cancelRecording()
      }
    },
    [isRecording, cancelRecording]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cancelRecording()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cancelRecording])

  return (
    <VoiceInputContainer>
      <CancelButton onClick={cancelRecording} disabled={isProcessing} />

      <div className="flex-1 flex items-center justify-center h-full">
        {isProcessing ? (
          <TranscriberProcessing />
        ) : (
          <LiveWaveform
            active={isRecording}
            stream={stream}
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
        onClick={stopRecording}
        isRecording={isRecording}
        isProcessing={isProcessing}
      />
    </VoiceInputContainer>
  )
})

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
