import { invoke } from '@tauri-apps/api/core'
import { emit } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useModelsStore } from '@/features/models'
import { useTranscriptionsStore } from '@/features/transcriptions'
import { ensureMicPermission } from '@/lib/microphone-permissions'

import {
  createControllableRecorder,
  playAudioFeedback,
} from '../services/audio-utils'
import { transcriptionService } from '../services/transcription-service'

export type FeedbackMessage =
  | 'cancelled'
  | 'processing'
  | 'completed'
  | 'error'
  | null

export function useVoiceRecording() {
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingStartTimeRef = useRef<number | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage>(null)

  const addTranscription = useTranscriptionsStore(
    state => state.addTranscription
  )
  const updateTranscription = useTranscriptionsStore(
    state => state.updateTranscription
  )
  const models = useModelsStore(state => state.models)

  const startRecording = useCallback(async () => {
    // Check and request permission if needed
    console.log('Starting recording, checking microphone permission...')
    const hasMicPermission = await ensureMicPermission()
    console.log('Has mic permission:', hasMicPermission)

    if (!hasMicPermission) {
      console.error('Microphone permission not granted via Tauri plugin')
      console.log('Attempting direct getUserMedia call anyway...')
    }

    try {
      // Get microphone stream - try even if Tauri permission check failed
      // because the webview might have its own permission
      console.log('Calling getUserMedia...')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      console.log('getUserMedia successful, got stream:', mediaStream)

      streamRef.current = mediaStream
      setStream(mediaStream)
      setIsRecording(true)
      recordingStartTimeRef.current = Date.now()

      // Play audio feedback for recording start
      playAudioFeedback('main')

      // Create audio context for analysis (if needed later)
      const AudioContextConstructor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      audioContextRef.current = new AudioContextConstructor()

      // Start recording audio for transcription
      const { recorder } = createControllableRecorder(mediaStream)
      mediaRecorderRef.current = recorder
      recorder.start()

      console.log('Recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      await emit('hide_voice_input')
    }
  }, [])

  const hideWindow = useCallback(async () => {
    const currentWindow = getCurrentWindow()
    try {
      await currentWindow.hide()
    } catch (error) {
      console.error('Failed to hide window:', error)
    }
  }, [])

  const stopRecording = useCallback(async () => {
    try {
      setIsRecording(false)
      setIsProcessing(true)
      setFeedbackMessage('processing')

      // Play audio feedback for recording stop
      playAudioFeedback('main')

      // Stop the media recorder and get the audio blob
      let audioBlob: Blob | null = null
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state === 'recording') {
        audioBlob = await new Promise<Blob>((resolve, reject) => {
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
        mediaRecorderRef.current = null
      }

      // Save audio and transcribe
      if (audioBlob) {
        try {
          // Calculate duration
          const duration = recordingStartTimeRef.current
            ? (Date.now() - recordingStartTimeRef.current) / 1000
            : 0

          const timestamp = Date.now()

          // Get selected model
          const selectedModel = models.find(m => m.isSelected && m.isEnabled)
          console.log('Selected model:', selectedModel)

          // Perform transcription in background
          if (selectedModel) {
            try {
              const result = await transcriptionService.transcribe(audioBlob, {
                provider: selectedModel.provider,
                model: selectedModel.id,
                apiKey: selectedModel.apiKey,
                language: 'en',
              })

              await addTranscription({
                text: result.text,
                audioBlob,
                duration,
                timestamp,
              })

              console.log('Transcription completed:', result.text)

              // Copy to clipboard and paste at cursor
              try {
                await invoke('copy_and_paste', { text: result.text })
                console.log('Text copied and pasted successfully')
              } catch (pasteError) {
                console.error('Failed to paste text:', pasteError)
              }
            } catch (transcriptionError) {
              console.error('Transcription failed:', transcriptionError)
              // Update with error message
              await addTranscription({
                text: `[Transcription failed: ${transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error'}]`,
                audioBlob,
                duration,
                timestamp,
              })
            }
          } else {
            // No model selected
            await addTranscription({
              text: '[No transcription model selected]',
              audioBlob,
              duration,
              timestamp,
            })
          }

          setFeedbackMessage('completed')
          await new Promise(resolve => setTimeout(resolve, 1500))
        } catch (error) {
          console.error('Failed to save recording:', error)
          setFeedbackMessage('error')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      recordingStartTimeRef.current = null

      // Clean up stream after processing
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
        setStream(null)
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }

      setIsProcessing(false)
      setFeedbackMessage(null)

      // Close window after feedback is shown
      await hideWindow()
    } catch (error) {
      console.error('Failed to stop recording:', error)
      setIsRecording(false)
      setIsProcessing(false)
      setFeedbackMessage('error')
      await new Promise(resolve => setTimeout(resolve, 2000))
      setFeedbackMessage(null)
      await hideWindow()
    }
  }, [addTranscription, updateTranscription, models, hideWindow])

  const cancelRecording = useCallback(async () => {
    setIsRecording(false)
    setIsProcessing(false)
    setFeedbackMessage('cancelled')

    // Play audio feedback for recording cancel
    playAudioFeedback('cancel')

    // Stop and clean up media recorder
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop()
    }
    mediaRecorderRef.current = null

    // Clean up stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setStream(null)
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Show cancelled message for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000))
    setFeedbackMessage(null)

    await hideWindow()
  }, [hideWindow])

  // Auto-start recording when component mounts
  // Component will be remounted on every window show due to key change
  useEffect(() => {
    setTimeout(() => {
      startRecording()
    }, 100)
  }, [startRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
        setStream(null)
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  return {
    isRecording,
    isProcessing,
    stream,
    feedbackMessage,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}
