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
}
