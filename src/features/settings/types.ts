export interface Settings {
  onboarding: {
    completed: boolean
  }
  voiceInput: {
    shortcut: string
  }
}

export interface SettingsStore {
  settings: Settings
  initialized: boolean
  initialize: () => Promise<void>
  setOnboardingComplete: (completed: boolean) => Promise<void>
  setVoiceInputShortcut: (shortcut: string) => Promise<void>
}

export const defaultSettings: Settings = {
  onboarding: {
    completed: false,
  },
  voiceInput: {
    shortcut: 'Alt+Space',
  },
}
