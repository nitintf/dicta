import {
  Settings,
  Keyboard,
  FileText,
  Cpu,
  Shield,
  Wrench,
  Info,
} from 'lucide-react'

import { SettingsGroup } from '../types/settings-navigation'

export const settingsNavigation: SettingsGroup[] = [
  {
    label: 'SETTINGS',
    sections: [
      {
        id: 'general',
        label: 'General',
        icon: Settings,
      },
      {
        id: 'shortcuts',
        label: 'Shortcuts',
        icon: Keyboard,
      },
      {
        id: 'transcription',
        label: 'Transcription',
        icon: FileText,
      },
      {
        id: 'models',
        label: 'Models',
        icon: Cpu,
      },
    ],
  },
  {
    label: 'ADVANCED',
    sections: [
      {
        id: 'privacy',
        label: 'Privacy & Data',
        icon: Shield,
      },
      {
        id: 'advanced',
        label: 'Advanced',
        icon: Wrench,
      },
      {
        id: 'about',
        label: 'About',
        icon: Info,
      },
    ],
  },
]
