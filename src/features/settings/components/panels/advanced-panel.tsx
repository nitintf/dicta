import { Button } from '@/components/ui/button'

import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'

export function AdvancedPanel() {
  return (
    <SettingsPanel
      title="Advanced"
      description="Advanced settings and developer options"
    >
      <SettingsSection title="Performance">
        <SettingItem
          title="Hardware acceleration"
          description="Use GPU for faster transcription processing"
          action={<Button variant="outline">Enabled</Button>}
        />

        <SettingItem
          title="Cache size"
          description="2.5 GB used for model cache"
          action={<Button variant="outline">Clear cache</Button>}
        />

        <SettingItem
          title="Background processing"
          description="Continue transcription when app is minimized"
          action={<Button variant="outline">Enabled</Button>}
        />
      </SettingsSection>

      <SettingsSection title="Developer">
        <SettingItem
          title="Debug mode"
          description="Show detailed logs and error information"
          action={<Button variant="outline">Disabled</Button>}
        />

        <SettingItem
          title="Developer tools"
          description="Open Chrome DevTools for debugging"
          action={<Button variant="outline">Open</Button>}
        />

        <SettingItem
          title="Experimental features"
          description="Enable beta features and improvements"
          action={<Button variant="outline">Configure</Button>}
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
