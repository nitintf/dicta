import { useState } from 'react'

import { Switch } from '@/components/ui/switch'

import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'
import { useSettingsStore } from '../../store'

export function TranscriptionPanel() {
  const {
    settings,
    setAutoPaste,
    setAutoCopyToClipboard,
    setAiProcessingEnabled,
  } = useSettingsStore()
  const [autoPasteLoading, setAutoPasteLoading] = useState(false)
  const [autoCopyLoading, setAutoCopyLoading] = useState(false)
  const [aiProcessingLoading, setAiProcessingLoading] = useState(false)

  const handleAutoPasteToggle = async (checked: boolean) => {
    setAutoPasteLoading(true)
    try {
      await setAutoPaste(checked)
    } catch (error) {
      console.error('Failed to toggle auto-paste:', error)
    } finally {
      setAutoPasteLoading(false)
    }
  }

  const handleAutoCopyToggle = async (checked: boolean) => {
    setAutoCopyLoading(true)
    try {
      await setAutoCopyToClipboard(checked)
    } catch (error) {
      console.error('Failed to toggle auto-copy:', error)
    } finally {
      setAutoCopyLoading(false)
    }
  }

  const handleAiProcessingToggle = async (checked: boolean) => {
    setAiProcessingLoading(true)
    try {
      await setAiProcessingEnabled(checked)
    } catch (error) {
      console.error('Failed to toggle AI processing:', error)
    } finally {
      setAiProcessingLoading(false)
    }
  }

  return (
    <SettingsPanel
      title="Transcription"
      description="Customize how your transcriptions are processed and saved"
    >
      <SettingsSection title="Behavior">
        <SettingItem
          title="Auto-paste where cursor is active"
          description="Automatically paste transcription text at cursor position"
          action={
            <Switch
              checked={settings.transcription.autoPaste}
              onCheckedChange={handleAutoPasteToggle}
              disabled={autoPasteLoading}
            />
          }
        />

        <SettingItem
          title="Auto-copy to clipboard"
          description="Copy transcription text to clipboard after completion"
          action={
            <Switch
              checked={settings.transcription.autoCopyToClipboard}
              onCheckedChange={handleAutoCopyToggle}
              disabled={autoCopyLoading}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="AI Post-Processing">
        <SettingItem
          title="Enable AI post-processing"
          description="Enhance transcriptions with AI-powered formatting and refinement"
          action={
            <Switch
              checked={settings.aiProcessing.enabled}
              onCheckedChange={handleAiProcessingToggle}
              disabled={aiProcessingLoading}
            />
          }
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
