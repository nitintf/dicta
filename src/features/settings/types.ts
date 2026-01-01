export interface Settings {
  onboarding: {
    completed: boolean
  }
  voiceInput: {
    shortcut: string
    microphoneDeviceId: string | null // null = default device
  }
  transcription: {
    language: string // ISO 639-1 code
  }
  shortcuts: {
    pasteLastTranscript: string
    globalShortcutsEnabled: boolean
  }
}

export interface SettingsStore {
  settings: Settings
  initialized: boolean
  initialize: () => Promise<void>
  setOnboardingComplete: (completed: boolean) => Promise<void>
  setVoiceInputShortcut: (shortcut: string) => Promise<void>
  setMicrophoneDevice: (deviceId: string | null) => Promise<void>
  setTranscriptionLanguage: (language: string) => Promise<void>
  setPasteShortcut: (shortcut: string) => Promise<void>
  setGlobalShortcutsEnabled: (enabled: boolean) => Promise<void>
}

export const defaultSettings: Settings = {
  onboarding: {
    completed: false,
  },
  voiceInput: {
    shortcut: 'Alt+Space',
    microphoneDeviceId: null,
  },
  transcription: {
    language: 'en',
  },
  shortcuts: {
    pasteLastTranscript: 'CmdOrCtrl+Shift+V',
    globalShortcutsEnabled: true,
  },
}
