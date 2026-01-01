import { Button } from '@/components/ui/button'

import { getLanguageByCode } from '../../data/languages'
import { useSettingsStore } from '../../store'
import { LanguageSelector } from '../language-selector'
import { MicrophoneSelector } from '../microphone-selector'
import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'

interface GeneralPanelProps {
  onNavigateToPanel?: (panelId: string) => void
}

export function GeneralPanel({ onNavigateToPanel }: GeneralPanelProps) {
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
          description={languageDescription}
          action={<LanguageSelector />}
        />

        <SettingItem
          title="Keyboard shortcuts"
          description="Configure voice input and paste shortcuts"
          action={
            <Button
              variant="outline"
              onClick={() => onNavigateToPanel?.('shortcuts')}
            >
              Configure
            </Button>
          }
        />

        <SettingItem
          title="Launch at startup"
          description="Automatically launch Dicta when you log in"
          action={<Button variant="outline">Enable</Button>}
        />

        <SettingItem
          title="Theme"
          description="System (Light mode)"
          action={<Button variant="outline">Change</Button>}
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
