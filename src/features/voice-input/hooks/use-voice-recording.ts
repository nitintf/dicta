import { emit } from '@tauri-apps/api/event'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  calculateDuration,
  cleanupAudioContext,
  cleanupMediaRecorder,
  cleanupMediaStream,
  createAudioContext,
  createControllableRecorder,
  delay,
  hideVoiceInputWindow,
  initializeMediaStream,
  playAudioFeedback,
  processTranscription,
  showFeedbackAndHide,
  stopMediaRecorder,
  type FeedbackMessage,
} from '@/features/voice-input/utils'

const FEEDBACK_DURATION = {
  COMPLETED: 500,
  ERROR: 500,
  CANCELLED: 750,
} as const

export function useVoiceRecording() {
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingStartTimeRef = useRef<number | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage>(null)

  /**
   * Starts recording by initializing media stream and recorder
   */
  const startRecording = useCallback(async () => {
    try {
      const mediaStream = await initializeMediaStream()

      streamRef.current = mediaStream
      setStream(mediaStream)
      setIsRecording(true)
      recordingStartTimeRef.current = Date.now()

      playAudioFeedback('main')

      audioContextRef.current = createAudioContext()

      const { recorder } = createControllableRecorder(mediaStream)
      mediaRecorderRef.current = recorder
      recorder.start()

      console.log('Recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      await emit('hide_voice_input')
    }
  }, [])

  /**
   * Stops recording and processes transcription
   */
  const stopRecording = useCallback(async () => {
    try {
      setIsRecording(false)
      setIsProcessing(true)
      setFeedbackMessage('processing')

      playAudioFeedback('main')

      const recorder = mediaRecorderRef.current
      let audioBlob: Blob | null = null

      if (recorder && recorder.state === 'recording') {
        audioBlob = await stopMediaRecorder(recorder)
        mediaRecorderRef.current = null
      }

      if (audioBlob) {
        try {
          const duration = calculateDuration(recordingStartTimeRef.current)
          const timestamp = Date.now()

          await processTranscription({ audioBlob, timestamp, duration })

          setFeedbackMessage('completed')
          await delay(FEEDBACK_DURATION.COMPLETED)
        } catch (transcriptionError) {
          console.error('Transcription failed:', transcriptionError)
          setFeedbackMessage('error')
          await delay(FEEDBACK_DURATION.ERROR)
        }
      }

      recordingStartTimeRef.current = null

      cleanupMediaStream(streamRef.current)
      streamRef.current = null
      setStream(null)

      cleanupAudioContext(audioContextRef.current)
      audioContextRef.current = null

      setIsProcessing(false)
      setFeedbackMessage(null)
      await hideVoiceInputWindow()
    } catch (error) {
      console.error('Failed to stop recording:', error)
      setIsRecording(false)
      setIsProcessing(false)
      await showFeedbackAndHide(
        setFeedbackMessage,
        'error',
        FEEDBACK_DURATION.ERROR * 2
      )
    }
  }, [])

  /**
   * Cancels recording without processing transcription
   */
  const cancelRecording = useCallback(async () => {
    setIsRecording(false)
    setIsProcessing(false)

    playAudioFeedback('cancel')

    cleanupMediaRecorder(mediaRecorderRef.current)
    mediaRecorderRef.current = null

    cleanupMediaStream(streamRef.current)
    streamRef.current = null
    setStream(null)

    cleanupAudioContext(audioContextRef.current)
    audioContextRef.current = null

    await showFeedbackAndHide(
      setFeedbackMessage,
      'cancelled',
      FEEDBACK_DURATION.CANCELLED
    )
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      startRecording()
    }, 100)

    return () => clearTimeout(timer)
  }, [startRecording])

  useEffect(() => {
    return () => {
      cleanupMediaStream(streamRef.current)
      streamRef.current = null
      setStream(null)

      cleanupAudioContext(audioContextRef.current)
      audioContextRef.current = null
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
