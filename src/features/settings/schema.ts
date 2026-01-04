import { z } from 'zod'

export const settingsSchema = z.object({
  onboarding: z.object({
    completed: z.boolean(),
  }),
  voiceInput: z.object({
    shortcut: z.string(),
    microphoneDeviceId: z.string().nullable(),
  }),
  transcription: z.object({
    language: z.string(),
    autoPaste: z.boolean(),
    autoCopyToClipboard: z.boolean(),
    selectedModelId: z.string().nullable(), // Selected speech-to-text model
  }),
  shortcuts: z.object({
    pasteLastTranscript: z.string(),
    globalShortcutsEnabled: z.boolean(),
  }),
  system: z.object({
    showInDock: z.boolean(),
    saveAudioRecordings: z.boolean(),
  }),
  privacy: z.object({
    analytics: z.boolean(),
    errorLogging: z.boolean(),
  }),
  aiProcessing: z.object({
    enabled: z.boolean(),
    modelId: z.string().nullable(), // Selected post-processing model
    expandSnippets: z.boolean(), // Whether to expand snippet triggers (e.g., "brb" -> "be right back")
  }),
})

export type Settings = z.infer<typeof settingsSchema>

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
    autoPaste: false,
    autoCopyToClipboard: false,
    selectedModelId: null,
  },
  shortcuts: {
    pasteLastTranscript: 'CmdOrCtrl+Shift+V',
    globalShortcutsEnabled: true,
  },
  system: {
    showInDock: true,
    saveAudioRecordings: false,
  },
  privacy: {
    analytics: false,
    errorLogging: true,
  },
  aiProcessing: {
    enabled: false,
    modelId: null,
    expandSnippets: false,
  },
}
