import { type Settings } from './schema'

export interface SettingsStore {
  settings: Settings
  initialized: boolean
  initialize: () => Promise<void>
  setOnboardingComplete: (completed: boolean) => Promise<void>
  setVoiceInputShortcut: (shortcut: string) => Promise<void>
  setMicrophoneDevice: (deviceId: string | null) => Promise<void>
  setTranscriptionLanguage: (language: string) => Promise<void>
  setAutoPaste: (enabled: boolean) => Promise<void>
  setAutoCopyToClipboard: (enabled: boolean) => Promise<void>
  setPasteShortcut: (shortcut: string) => Promise<void>
  setGlobalShortcutsEnabled: (enabled: boolean) => Promise<void>
  setShowInDock: (enabled: boolean) => Promise<void>
  setSaveAudioRecordings: (enabled: boolean) => Promise<void>
  setAnalytics: (enabled: boolean) => Promise<void>
  setErrorLogging: (enabled: boolean) => Promise<void>
  resetSettings: () => Promise<void>
  setAiProcessingEnabled: (enabled: boolean) => Promise<void>
  setAiProcessingModel: (modelId: string | null) => Promise<void>
  setExpandSnippets: (enabled: boolean) => Promise<void>
  setSelectedTranscriptionModel: (modelId: string | null) => Promise<void>
}
