import { Button } from '@/components/ui/button'

import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'

export function ModelsPanel() {
  return (
    <SettingsPanel
      title="Models"
      description="Manage transcription and AI models"
    >
      <SettingsSection title="Transcription Models">
        <SettingItem
          title="Default transcription model"
          description="Whisper Large v3"
          action={<Button variant="outline">Change</Button>}
        />

        <SettingItem
          title="Model quality"
          description="Balance between speed and accuracy"
          action={<Button variant="outline">Configure</Button>}
        />

        <SettingItem
          title="Local models"
          description="Download models for offline use"
          action={<Button variant="outline">Manage</Button>}
        />
      </SettingsSection>

      <SettingsSection title="AI Models">
        <SettingItem
          title="Default AI model"
          description="GPT-4 for text enhancement and styling"
          action={<Button variant="outline">Change</Button>}
        />

        <SettingItem
          title="API keys"
          description="Manage API keys for third-party services"
          action={<Button variant="outline">Manage</Button>}
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
