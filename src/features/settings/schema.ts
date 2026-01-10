// Import and re-export generated types from Rust
import type { Settings } from './types/generated'

export type {
  Settings,
  OnboardingSettings,
  VoiceInputSettings,
  TranscriptionSettings,
  ShortcutsSettings,
  SystemSettings,
  PrivacySettings,
  AiProcessingSettings,
} from './types/generated'

export const defaultSettings: Settings = {
  onboarding: {
    completed: false,
  },
  voiceInput: {
    shortcut: 'Alt+Space',
    microphoneDeviceId: null,
    enablePushToTalk: false,
    pushToTalkShortcut: 'Alt+R',
  },
  transcription: {
    language: 'en',
    autoPaste: false,
    autoCopyToClipboard: false,
    speechToTextModelId: null,
  },
  shortcuts: {
    pasteLastTranscript: 'CmdOrCtrl+Shift+V',
    globalShortcutsEnabled: true,
  },
  system: {
    showInDock: true,
    saveAudioRecordings: false,
    playSoundOnRecording: true,
  },
  privacy: {
    analytics: false,
    errorLogging: true,
  },
  aiProcessing: {
    enabled: false,
    postProcessingModelId: null,
  },
}
