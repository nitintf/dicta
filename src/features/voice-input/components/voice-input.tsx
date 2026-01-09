import { listen } from '@tauri-apps/api/event'
import { useEffect, useState } from 'react'

import { LiveWaveform } from '@/components/ui/live-waveform'
import { useAudioRecording } from '@/hooks/use-audio-recording'

import { AudioDots } from './audio-dots'
import { CancelButton } from './cancel-button'
import { StopButton } from './stop-button'
import { VoiceInputContainer } from './voice-input-container'

export const VoiceInput = () => {
  const recording = useAudioRecording()
  const [audioLevel, setAudioLevel] = useState(0)

  useEffect(() => {
    if (recording.isRecording) {
      let isMounted = true
      let unlistenFn: (() => void) | undefined

      listen<number>('audio-level', event => {
        console.log('audio-level', event.payload)
        if (isMounted) setAudioLevel(event.payload)
      }).then(unlisten => {
        if (!isMounted) {
          unlisten()
          return
        }
        unlistenFn = unlisten
      })

      return () => {
        isMounted = false
        if (unlistenFn) unlistenFn()
        setAudioLevel(0)
      }
    } else {
      setAudioLevel(0)
    }
  }, [recording.isRecording])

  const isTranscribing = recording.state === 'transcribing'
  const isProcessing = recording.state === 'stopping' || isTranscribing

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
          // <LiveWaveform
          //   active={recording.isRecording}
          //   stream={null} // Backend handles recording, no stream needed
          //   mode="static"
          //   barWidth={1.5}
          //   barGap={1.5}
          //   barRadius={5}
          //   barColor="#ffffff"
          //   height={20}
          //   sensitivity={1.5}
          //   fadeEdges
          //   fadeWidth={50}
          //   audioLevel={audioLevel} // Pass audio level from backend
          //   className="h-full w-full flex flex-1"
          // />
          <AudioDots state={recording.state} audioLevel={audioLevel} />
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
