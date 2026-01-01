import { Button } from '@/components/ui/button'

import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'

export function PrivacyPanel() {
  return (
    <SettingsPanel
      title="Privacy & Data"
      description="Control how your data is stored and used"
    >
      <SettingsSection title="Data Storage">
        <SettingItem
          title="Storage location"
          description="~/Documents/Dicta"
          action={<Button variant="outline">Change</Button>}
        />

        <SettingItem
          title="Data retention"
          description="Keep transcriptions for 30 days"
          action={<Button variant="outline">Configure</Button>}
        />

        <SettingItem
          title="Export data"
          description="Download all your transcriptions and settings"
          action={<Button variant="outline">Export</Button>}
        />
      </SettingsSection>

      <SettingsSection title="Privacy">
        <SettingItem
          title="Analytics"
          description="Help improve Dicta by sharing anonymous usage data"
          action={<Button variant="outline">Enabled</Button>}
        />

        <SettingItem
          title="Cloud sync"
          description="Sync transcriptions across devices"
          action={<Button variant="outline">Disabled</Button>}
        />

        <SettingItem
          title="Clear all data"
          description="Delete all transcriptions and reset settings"
          action={
            <Button variant="outline" className="text-destructive">
              Clear
            </Button>
          }
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
