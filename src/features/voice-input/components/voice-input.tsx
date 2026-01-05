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
    feedbackMessage,
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

  // Handle ESC key to cancel recording
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

  const getFeedbackText = () => {
    switch (feedbackMessage) {
      case 'cancelled':
        return 'Recording cancelled'
      case 'completed':
        return 'Saved!'
      case 'error':
        return 'Error saving recording'
      case 'processing':
        return 'Processing...'
      default:
        return null
    }
  }

  const feedbackText = getFeedbackText()

  return (
    <VoiceInputContainer>
      <CancelButton
        onClick={cancelRecording}
        disabled={isProcessing || feedbackMessage !== null}
      />

      {/* Waveform - center, takes most space */}
      <div className="flex-1 flex items-center justify-center h-full relative">
        {/* Show waveform or processing animation */}
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

        {/* Overlay feedback text on top of waveform */}
        {feedbackText && feedbackMessage !== 'processing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full">
            <div className="text-white text-xs font-medium px-3 text-center">
              {feedbackText}
            </div>
          </div>
        )}
      </div>

      <StopButton
        onClick={stopRecording}
        isRecording={isRecording}
        isProcessing={isProcessing || feedbackMessage !== null}
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
