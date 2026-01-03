import { Switch } from '@/components/ui/switch'

import { useSettingsStore } from '../../store'
import { ShortcutRecorder } from '../shortcut-recorder'
import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'

export function ShortcutsPanel() {
  const {
    settings,
    setVoiceInputShortcut,
    setPasteShortcut,
    setGlobalShortcutsEnabled,
  } = useSettingsStore()

  return (
    <SettingsPanel
      title="Keyboard Shortcuts"
      description="Configure keyboard shortcuts for quick access"
    >
      <SettingsSection>
        <SettingItem
          title="Global shortcuts"
          description="Enable or disable all global keyboard shortcuts"
          action={
            <Switch
              checked={settings.shortcuts.globalShortcutsEnabled}
              onCheckedChange={setGlobalShortcutsEnabled}
            />
          }
        />

        <SettingItem
          title="Voice input activation"
          description={
            settings.shortcuts.globalShortcutsEnabled
              ? 'Shortcut to start/stop voice recording'
              : 'Global shortcuts are disabled'
          }
          action={
            <ShortcutRecorder
              value={settings.voiceInput.shortcut}
              onChange={setVoiceInputShortcut}
              placeholder="Not set"
              disabled={!settings.shortcuts.globalShortcutsEnabled}
            />
          }
        />

        <SettingItem
          title="Paste last transcript"
          description={
            settings.shortcuts.globalShortcutsEnabled
              ? 'Quickly paste your most recent transcription'
              : 'Global shortcuts are disabled'
          }
          action={
            <ShortcutRecorder
              value={settings.shortcuts.pasteLastTranscript}
              onChange={setPasteShortcut}
              placeholder="Not set"
              disabled={!settings.shortcuts.globalShortcutsEnabled}
            />
          }
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
