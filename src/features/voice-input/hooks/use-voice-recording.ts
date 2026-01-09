import { emit } from '@tauri-apps/api/event'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useSettingsStore } from '@/features/settings/store'
import {
  calculateDuration,
  cleanupAudioContext,
  cleanupMediaRecorder,
  cleanupMediaStream,
  createAudioContext,
  createControllableRecorder,
  hideVoiceInputWindow,
  initializeMediaStream,
  playAudioFeedback,
  processTranscription,
  showToast,
  stopMediaRecorder,
} from '@/features/voice-input/utils'

export function useVoiceRecording() {
  const { settings } = useSettingsStore()
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingStartTimeRef = useRef<number | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  /**
   * Starts recording by initializing media stream and recorder
   */
  const startRecording = useCallback(async () => {
    try {
      // Use selected microphone device from settings
      const deviceId = settings.voiceInput.microphoneDeviceId
      const mediaStream = await initializeMediaStream(deviceId)

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

      const errorMsg = error instanceof Error ? error.message : String(error)
      let userMessage = 'Failed to start recording'

      if (
        errorMsg.includes('Permission denied') ||
        errorMsg.includes('NotAllowedError')
      ) {
        userMessage = 'Microphone access denied. Please enable it in Settings.'
      } else if (
        errorMsg.includes('NotFoundError') ||
        errorMsg.includes('not found')
      ) {
        userMessage = 'Microphone not found. Please check your device.'
      } else if (errorMsg.includes('NotReadableError')) {
        userMessage = 'Microphone in use by another app.'
      }

      // Small delay before hiding to allow any UI updates to render
      await new Promise(resolve => setTimeout(resolve, 100))

      await showToast(userMessage, 'error')
      await emit('hide_voice_input')
    }
  }, [settings.voiceInput.microphoneDeviceId])

  /**
   * Stops recording and processes transcription
   */
  const stopRecording = useCallback(async () => {
    try {
      setIsRecording(false)
      setIsProcessing(true)

      playAudioFeedback('main')

      // Wait for audio to play before hiding
      await new Promise(resolve => setTimeout(resolve, 200))

      const recorder = mediaRecorderRef.current
      let audioBlob: Blob | null = null

      if (recorder && recorder.state === 'recording') {
        audioBlob = await stopMediaRecorder(recorder)
        mediaRecorderRef.current = null
      }

      if (audioBlob && audioBlob.size > 0) {
        try {
          const duration = calculateDuration(recordingStartTimeRef.current)
          const timestamp = Date.now()

          const result = await processTranscription({
            audioBlob,
            timestamp,
            duration,
          })

          if (result !== null && result !== undefined) {
            // Add a small delay before hiding window for better UX
            await new Promise(resolve => setTimeout(resolve, 300))
            await hideVoiceInputWindow()
            await showToast('Transcription saved successfully', 'success')
          } else {
            // Silent audio or empty transcription
            await new Promise(resolve => setTimeout(resolve, 100))
            await hideVoiceInputWindow()
          }
        } catch (transcriptionError) {
          console.error('Transcription failed:', transcriptionError)
          await new Promise(resolve => setTimeout(resolve, 100))
          await hideVoiceInputWindow()

          // Parse error message and provide helpful feedback
          const errorMsg =
            transcriptionError instanceof Error
              ? transcriptionError.message
              : String(transcriptionError)

          let userMessage = 'Failed to save transcription'

          if (errorMsg.includes('No model is currently loaded')) {
            userMessage =
              'Model not loaded. Please start the model in Settings.'
          } else if (errorMsg.includes('API key not found')) {
            userMessage = 'API key missing. Please add it in Settings.'
          } else if (errorMsg.includes('No speech-to-text model selected')) {
            userMessage = 'No model selected. Please choose one in Settings.'
          } else if (
            errorMsg.includes('Model') &&
            errorMsg.includes('not found')
          ) {
            userMessage = 'Selected model not found. Please choose another.'
          } else if (
            errorMsg.includes('network') ||
            errorMsg.includes('fetch')
          ) {
            userMessage = 'Network error. Please check your connection.'
          } else if (
            errorMsg.toLowerCase().includes('quota') ||
            errorMsg.toLowerCase().includes('limit')
          ) {
            userMessage = 'API quota exceeded. Check your API limits.'
          }

          await showToast(userMessage, 'error')
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 100))
        await hideVoiceInputWindow()
      }

      recordingStartTimeRef.current = null

      cleanupMediaStream(streamRef.current)
      streamRef.current = null
      setStream(null)

      cleanupAudioContext(audioContextRef.current)
      audioContextRef.current = null

      setIsProcessing(false)
    } catch (error) {
      console.error('Failed to stop recording:', error)
      setIsRecording(false)
      setIsProcessing(false)
      await new Promise(resolve => setTimeout(resolve, 100))
      await hideVoiceInputWindow()
      await showToast('Unexpected error occurred', 'error')
    }
  }, [])

  /**
   * Cancels recording without processing transcription
   */
  const cancelRecording = useCallback(async () => {
    setIsRecording(false)
    setIsProcessing(false)

    playAudioFeedback('cancel')

    // Wait for audio to play before hiding
    await new Promise(resolve => setTimeout(resolve, 200))

    cleanupMediaRecorder(mediaRecorderRef.current)
    mediaRecorderRef.current = null

    cleanupMediaStream(streamRef.current)
    streamRef.current = null
    setStream(null)

    cleanupAudioContext(audioContextRef.current)
    audioContextRef.current = null

    await hideVoiceInputWindow()
    await showToast('Voice recording cancelled', 'warning')
  }, [])

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
    startRecording,
    stopRecording,
    cancelRecording,
  }
}
