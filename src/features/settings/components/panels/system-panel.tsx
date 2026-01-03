import { LaunchAtStartup } from '../launch-at-startup'
import { SaveAudioRecordings } from '../save-audio-recordings'
import { ShowInDock } from '../show-in-dock'
import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'

export function SystemPanel() {
  return (
    <SettingsPanel
      title="System"
      description="Configure system-level application behavior"
    >
      <SettingsSection>
        <SettingItem
          title="Launch at startup"
          description="Automatically launch Dicta when you log in"
          action={<LaunchAtStartup />}
        />

        <SettingItem
          title="Show app in dock"
          description="Display Dicta icon in the macOS dock"
          action={<ShowInDock />}
        />

        <SettingItem
          title="Save audio recordings"
          description="Automatically save audio files of your recordings"
          action={<SaveAudioRecordings />}
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
