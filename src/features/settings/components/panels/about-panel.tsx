import { Button } from '@/components/ui/button'

import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'
import packageJson from '../../../../../package.json'

export function AboutPanel() {
  return (
    <SettingsPanel title="About" description="Information about Dicta">
      <SettingsSection title="Application">
        <SettingItem
          title="Version"
          description={`Dicta ${packageJson.version}`}
        />

        <SettingItem
          title="Check for updates"
          description="Stay up to date with the latest features and fixes"
          action={<Button variant="outline">Check now</Button>}
        />

        <SettingItem
          title="Release notes"
          description="See what's new in this version"
          action={<Button variant="outline">View</Button>}
        />
      </SettingsSection>

      <SettingsSection title="Resources">
        <SettingItem
          title="Documentation"
          description="Learn how to use Dicta effectively"
          action={<Button variant="outline">Open</Button>}
        />

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

        <SettingItem
          title="License"
          description="View license information"
          action={<Button variant="outline">View</Button>}
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
