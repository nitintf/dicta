import { getLanguageByCode } from '../../data/languages'
import { useSettingsStore } from '../../store'
import { LanguageSelector } from '../language-selector'
import { MicrophoneSelector } from '../microphone-selector'
import { ThemeSelector } from '../theme-selector'
import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'

export function GeneralPanel() {
  const { settings } = useSettingsStore()

  const selectedLanguage = getLanguageByCode(settings.transcription.language)
  const languageDescription = selectedLanguage
    ? `${selectedLanguage.name} (${selectedLanguage.nativeName})`
    : 'English'

  return (
    <SettingsPanel
      title="General"
      description="Manage your general application preferences"
    >
      <SettingsSection>
        <SettingItem
          title="Microphone"
          description="Select your preferred microphone device"
          action={<MicrophoneSelector />}
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
