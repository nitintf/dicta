import { Switch } from '@/components/ui/switch'
import { useAudioDevices } from '@/hooks/use-audio-devices'

import { getLanguageByCode } from '../../data/languages'
import { useSettingsStore } from '../../store'
import { LanguageSelector } from '../language-selector'
import { MicrophoneSelector } from '../microphone-selector'
import { ThemeSelector } from '../theme-selector'
import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'

export function GeneralPanel() {
  const { settings, setEnablePushToTalk } = useSettingsStore()
  const { devices } = useAudioDevices()

  const selectedLanguage = getLanguageByCode(settings.transcription.language)
  const languageDescription = selectedLanguage
    ? `${selectedLanguage.name} (${selectedLanguage.nativeName})`
    : 'English'

  // Get the currently selected microphone name for description
  const selectedDeviceId = settings.voiceInput.microphoneDeviceId
  const selectedDevice = selectedDeviceId
    ? devices.find(d => d.deviceId === selectedDeviceId)
    : null
  const defaultDevice = devices.find(d => d.isDefault || d.isRecommended)
  const microphoneDescription = selectedDevice
    ? `Currently using: ${selectedDevice.label || `Microphone ${selectedDevice.deviceId.substring(0, 8)}`}`
    : defaultDevice
      ? `Currently using: Auto-detect (${defaultDevice.label})`
      : 'Select your preferred microphone device'

  return (
    <SettingsPanel
      title="General"
      description="Manage your general application preferences"
    >
      <SettingsSection>
        <SettingItem
          title="Microphone"
          description={microphoneDescription}
          action={<MicrophoneSelector />}
        />

        <SettingItem
          title="Enable Push-to-Talk"
          description={
            settings.voiceInput.enablePushToTalk
              ? 'Hold shortcut to record, release to stop'
              : 'Toggle mode is always active - click shortcut to start/stop'
          }
          action={
            <Switch
              checked={settings.voiceInput.enablePushToTalk}
              onCheckedChange={setEnablePushToTalk}
            />
          }
        />

        <SettingItem
          title="Transcription language"
          description={`${languageDescription} - Currently we only support English`}
          action={<LanguageSelector disabled={true} />}
          disabled={true}
        />

        <SettingItem
          title="Theme"
          description="Choose your preferred color theme"
          action={<ThemeSelector />}
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
