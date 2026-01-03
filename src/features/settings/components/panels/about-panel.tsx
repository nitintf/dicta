import { Button } from '@/components/ui/button'
import { appConfig } from '@/config'

import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'

export function AboutPanel() {
  return (
    <SettingsPanel title="About" description="Information about Dicta">
      <SettingsSection title="Application">
        <SettingItem
          title="Version"
          description={`Dicta ${appConfig.version}`}
        />

        <SettingItem
          title="Check for updates"
          description="Stay up to date with the latest features and fixes"
          action={<Button variant="outline">Check now</Button>}
        />
      </SettingsSection>

      <SettingsSection title="Resources">
        <SettingItem
          title="Support"
          description="Get help and report issues"
          action={<Button variant="outline">Contact</Button>}
        />

        <SettingItem
          title="Privacy policy"
          description="How we handle your data"
          action={<Button variant="outline">View</Button>}
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
