import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAudioDevices } from '@/hooks/use-audio-devices'

import { getLanguageByCode } from '../../data/languages'
import { useSettingsStore } from '../../store'
import { LanguageSelector } from '../language-selector'
import { MicrophoneSelector } from '../microphone-selector'
import { ThemeSelector } from '../theme-selector'
import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'

export function GeneralPanel() {
  const { settings, setRecordingMode } = useSettingsStore()
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

  const recordingModeLabel =
    settings.voiceInput.recordingMode === 'pushtotalk'
      ? 'Push-to-Talk'
      : 'Toggle'

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
          title="Recording mode"
          description={
            settings.voiceInput.recordingMode === 'pushtotalk'
              ? 'Hold shortcut to record, release to stop'
              : 'Click shortcut to start/stop recording'
          }
          action={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-between">
                  {recordingModeLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={settings.voiceInput.recordingMode}
                  onValueChange={value =>
                    setRecordingMode(value as 'toggle' | 'pushtotalk')
                  }
                >
                  <DropdownMenuRadioItem value="toggle">
                    Toggle Mode
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pushtotalk">
                    Push-to-Talk
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
