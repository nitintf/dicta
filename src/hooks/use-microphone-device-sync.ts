import { useCallback } from 'react'

import { useSettingsStore } from '@/features/settings/store'

import { useTauriEvent } from './use-tauri-event'

import type { MicrophoneDeviceChangedPayload } from '@/features/settings/types/microphone-device-changed'

/**
 * Hook to sync microphone device changes from tray menu with settings store
 *
 * This hook automatically listens for the 'microphone-device-changed' event
 * emitted by the backend when a user selects a different microphone from the
 * tray menu. It updates the settings store to keep the frontend in sync.
 *
 * @example
 * ```tsx
 * function App() {
 *   // Just call the hook - it handles everything automatically
 *   useMicrophoneDeviceSync()
 *
 *   return <YourComponents />
 * }
 * ```
 */
export const useMicrophoneDeviceSync = () => {
  const setMicrophoneDevice = useSettingsStore(
    state => state.setMicrophoneDevice
  )

  const handleDeviceChange = useCallback(
    (event: { payload: MicrophoneDeviceChangedPayload }) => {
      const { microphoneDeviceId } = event.payload

      console.log(
        'Microphone device changed from tray menu:',
        microphoneDeviceId
      )

      // Update the settings store with the new device ID
      // This will sync the UI (e.g., settings panel) with the tray menu selection
      setMicrophoneDevice(microphoneDeviceId)
    },
    [setMicrophoneDevice]
  )

  // Listen for microphone device changes from the backend
  useTauriEvent<MicrophoneDeviceChangedPayload>(
    'microphone-device-changed',
    handleDeviceChange
  )
}
