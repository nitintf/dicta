import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { useCallback, useEffect, useState } from 'react'

import type { RecordingResponse } from '@/features/voice-input/types/generated/RecordingResponse'
import type { RecordingState } from '@/features/voice-input/types/generated/RecordingState'

interface UseAudioRecordingReturn {
  state: RecordingState
  isRecording: boolean
  isActive: boolean
  error: string | null
  filePath: string | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  cancelRecording: () => Promise<void>
}

/**
 * Hook for managing audio recording through Tauri backend
 * Handles state synchronization and provides clean API for recording controls
 */
export function useAudioRecording(): UseAudioRecordingReturn {
  const [state, setState] = useState<RecordingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [filePath, setFilePath] = useState<string | null>(null)

  // Listen for state changes from backend
  useEffect(() => {
    let unlisten: UnlistenFn | undefined

    const setupListener = async () => {
      unlisten = await listen<RecordingState>(
        'recording-state-changed',
        event => {
          setState(event.payload)
        }
      )
    }

    setupListener()

    return () => {
      if (unlisten) {
        unlisten()
      }
    }
  }, [])

  // Load initial state on mount
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const response = await invoke<RecordingResponse>('get_recording_state')
        setState(response.state)
        setError(response.error || null)
        setFilePath(response.filePath || null)
      } catch (err) {
        console.error('Failed to load recording state:', err)
      }
    }

    loadInitialState()
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const response = await invoke<RecordingResponse>('start_recording')
      if (response.success) {
        setState(response.state)
        setFilePath(response.filePath || null)
        setError(null)
      } else {
        setError(response.error || 'Failed to start recording')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      setError(errorMsg)
      console.error('Failed to start recording:', err)
    }
  }, [])

  const stopRecording = useCallback(async () => {
    try {
      const response = await invoke<RecordingResponse>('stop_recording')
      if (response.success) {
        setState(response.state)
        setError(null)
      } else {
        setError(response.error || 'Failed to stop recording')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      setError(errorMsg)
      console.error('Failed to stop recording:', err)
    }
  }, [])

  const cancelRecording = useCallback(async () => {
    try {
      const response = await invoke<RecordingResponse>('cancel_recording')
      if (response.success) {
        setState(response.state)
        setFilePath(null)
        setError(null)
      } else {
        setError(response.error || 'Failed to cancel recording')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      setError(errorMsg)
      console.error('Failed to cancel recording:', err)
    }
  }, [])

  const isRecording = state === 'recording'
  const isActive = state !== 'idle' && state !== 'error'

  return {
    state,
    isRecording,
    isActive,
    error,
    filePath,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}
