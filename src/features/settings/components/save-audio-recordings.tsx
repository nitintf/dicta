import { useState } from 'react'

import { Switch } from '@/components/ui/switch'

import { useSettingsStore } from '../store'

export function SaveAudioRecordings() {
  const { settings, setSaveAudioRecordings } = useSettingsStore()
  const [loading, setLoading] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setLoading(true)
    try {
      await setSaveAudioRecordings(checked)
    } catch (error) {
      console.error('Failed to toggle save audio recordings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Switch
      checked={settings.system.saveAudioRecordings}
      onCheckedChange={handleToggle}
      disabled={loading}
    />
  )
}
