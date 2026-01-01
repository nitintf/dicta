import { LucideIcon } from 'lucide-react'

export interface SettingsSection {
  id: string
  label: string
  icon: LucideIcon
}

export interface SettingsGroup {
  label: string
  sections: SettingsSection[]
}

export type SettingsPanelId =
  | 'general'
  | 'shortcuts'
  | 'transcription'
  | 'models'
  | 'privacy'
  | 'advanced'
  | 'about'
