import {
  Settings,
  Keyboard,
  FileText,
  Monitor,
  Shield,
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
        id: 'system',
        label: 'System',
        icon: Monitor,
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
        id: 'about',
        label: 'About',
        icon: Info,
      },
    ],
  },
]
