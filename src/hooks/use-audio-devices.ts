import { invoke } from '@tauri-apps/api/core'
import { useCallback, useEffect, useState } from 'react'

import type { AudioDevice } from '@/features/voice-input/types/generated'

export type { AudioDevice }

export interface UseAudioDevicesReturn {
  devices: AudioDevice[]
  hasPermission: boolean
  isLoading: boolean
  refreshDevices: () => Promise<void>
  error: string | null
}

export function useAudioDevices(): UseAudioDevicesReturn {
  const [devices, setDevices] = useState<AudioDevice[]>([])
  const [hasPermission, setHasPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const enumerateDevices = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const tauriDevices = await invoke<AudioDevice[]>(
        'enumerate_audio_devices'
      )

      const browserDevices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = browserDevices.filter(
        device => device.kind === 'audioinput'
      )

      const mergedDevices: AudioDevice[] = []

      const hasLabels = audioInputs.some(device => device.label !== '')
      setHasPermission(hasLabels)

      if (hasLabels) {
        // If we have permission, use browser device IDs with Tauri labels
        audioInputs.forEach(browserDevice => {
          const matchingTauriDevice = tauriDevices.find(
            td =>
              browserDevice.label
                .toLowerCase()
                .includes(td.label.toLowerCase()) ||
              td.label.toLowerCase().includes(browserDevice.label.toLowerCase())
          )

          mergedDevices.push({
            deviceId: browserDevice.deviceId,
            label: matchingTauriDevice?.label || browserDevice.label,
            isDefault: matchingTauriDevice?.isDefault || false,
            isRecommended: matchingTauriDevice?.isRecommended || false,
          })
        })
      } else {
        // No permission yet, use Tauri devices with placeholder IDs
        tauriDevices.forEach(td => {
          mergedDevices.push({
            deviceId: td.deviceId,
            label: td.label,
            isDefault: td.isDefault,
            isRecommended: td.isRecommended,
          })
        })
      }

      setDevices(mergedDevices)
    } catch (err) {
      console.error('Error enumerating audio devices:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to enumerate devices'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshDevices = useCallback(async () => {
    await enumerateDevices()
  }, [enumerateDevices])

  useEffect(() => {
    enumerateDevices()

    const handleDeviceChange = () => {
      console.log('Audio devices changed, refreshing list...')
      enumerateDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener(
        'devicechange',
        handleDeviceChange
      )
    }
  }, [enumerateDevices])

  return {
    devices,
    hasPermission,
    isLoading,
    refreshDevices,
    error,
  }
}
