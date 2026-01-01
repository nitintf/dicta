import { Button } from '@/components/ui/button'

import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'

export function TranscriptionPanel() {
  return (
    <SettingsPanel
      title="Transcription"
      description="Customize how your transcriptions are processed and saved"
    >
      <SettingsSection title="Behavior">
        <SettingItem
          title="Auto-save transcriptions"
          description="Automatically save transcriptions when recording stops"
          action={<Button variant="outline">Enabled</Button>}
        />

        <SettingItem
          title="Auto-copy to clipboard"
          description="Copy transcription text to clipboard after completion"
          action={<Button variant="outline">Disabled</Button>}
        />

        <SettingItem
          title="Default style"
          description="Apply a style template to new transcriptions"
          action={<Button variant="outline">Select</Button>}
        />
      </SettingsSection>

      <SettingsSection title="Formatting">
        <SettingItem
          title="Punctuation"
          description="Automatic punctuation and capitalization"
          action={<Button variant="outline">Enabled</Button>}
        />

        <SettingItem
          title="Paragraphs"
          description="Auto-detect paragraph breaks"
          action={<Button variant="outline">Enabled</Button>}
        />

        <SettingItem
          title="Timestamps"
          description="Include timestamps in transcriptions"
          action={<Button variant="outline">Disabled</Button>}
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
