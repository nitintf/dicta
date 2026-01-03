import { useState } from 'react'

import { Switch } from '@/components/ui/switch'

import { useSettingsStore } from '../store'

export function ShowInDock() {
  const { settings, setShowInDock } = useSettingsStore()
  const [loading, setLoading] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setLoading(true)
    try {
      await setShowInDock(checked)
    } catch (error) {
      console.error('Failed to toggle show in dock:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Switch
      checked={settings.system.showInDock}
      onCheckedChange={handleToggle}
      disabled={loading}
    />
  )
}
