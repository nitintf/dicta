import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart'
import { useEffect, useState } from 'react'

import { Switch } from '@/components/ui/switch'

export function LaunchAtStartup() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await isEnabled()
        setEnabled(status)
      } catch (error) {
        console.error('Failed to check autostart status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [])

  const handleToggle = async (checked: boolean) => {
    setLoading(true)
    try {
      if (checked) {
        await enable()
        setEnabled(true)
      } else {
        await disable()
        setEnabled(false)
      }
    } catch (error) {
      console.error('Failed to toggle autostart:', error)
      const status = await isEnabled()
      setEnabled(status)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Switch
      checked={enabled}
      onCheckedChange={handleToggle}
      disabled={loading}
    />
  )
}
