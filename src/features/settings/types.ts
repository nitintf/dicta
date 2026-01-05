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
  setSpeechToTextModel: (modelId: string | null) => Promise<void>
  setPostProcessingModel: (modelId: string | null) => Promise<void>
}
