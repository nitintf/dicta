import { invoke } from '@tauri-apps/api/core'
import { Store, load } from '@tauri-apps/plugin-store'
import { create } from 'zustand'

import { defaultSettings, type Settings } from './schema'

import type { SettingsStore } from './types'

let tauriStore: Store | null = null

const getTauriStore = async () => {
  if (!tauriStore) {
    tauriStore = await load('settings')
  }
  return tauriStore
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  initialized: false,

  initialize: async () => {
    try {
      const store = await getTauriStore()
      const storedSettings = await store.get<Settings>('settings')

      const settings: Settings = {
        onboarding: {
          completed: storedSettings?.onboarding?.completed ?? false,
        },
        voiceInput: {
          shortcut: storedSettings?.voiceInput?.shortcut ?? 'Alt+Space',
          microphoneDeviceId:
            storedSettings?.voiceInput?.microphoneDeviceId ?? null,
        },
        transcription: {
          language: storedSettings?.transcription?.language ?? 'en',
          autoPaste: storedSettings?.transcription?.autoPaste ?? false,
          autoCopyToClipboard:
            storedSettings?.transcription?.autoCopyToClipboard ?? false,
          selectedModelId:
            storedSettings?.transcription?.selectedModelId ?? null,
        },
        shortcuts: {
          pasteLastTranscript:
            storedSettings?.shortcuts?.pasteLastTranscript ??
            'CmdOrCtrl+Shift+V',
          globalShortcutsEnabled:
            storedSettings?.shortcuts?.globalShortcutsEnabled ?? true,
        },
        system: {
          showInDock: storedSettings?.system?.showInDock ?? true,
          saveAudioRecordings:
            storedSettings?.system?.saveAudioRecordings ?? false,
        },
        privacy: {
          analytics: storedSettings?.privacy?.analytics ?? false,
          errorLogging: storedSettings?.privacy?.errorLogging ?? true,
        },
        aiProcessing: {
          enabled: storedSettings?.aiProcessing?.enabled ?? false,
          modelId: storedSettings?.aiProcessing?.modelId ?? null,
          expandSnippets: storedSettings?.aiProcessing?.expandSnippets ?? false,
        },
      }

      set({ settings, initialized: true })
    } catch (error) {
      console.error('Error initializing settings store:', error)
      set({ settings: defaultSettings, initialized: true })
    }
  },

  setOnboardingComplete: async (completed: boolean) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        onboarding: { completed },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error saving onboarding status:', error)
    }
  },

  setVoiceInputShortcut: async (shortcut: string) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        voiceInput: {
          ...get().settings.voiceInput,
          shortcut,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })

      // Update the global shortcut registration
      await invoke('update_voice_input_shortcut', { shortcutStr: shortcut })
    } catch (error) {
      console.error('Error saving voice input shortcut:', error)
    }
  },

  setMicrophoneDevice: async (deviceId: string | null) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        voiceInput: {
          ...get().settings.voiceInput,
          microphoneDeviceId: deviceId,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error saving microphone device:', error)
    }
  },

  setTranscriptionLanguage: async (language: string) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        transcription: {
          ...get().settings.transcription,
          language,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error saving transcription language:', error)
    }
  },

  setPasteShortcut: async (shortcut: string) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        shortcuts: {
          ...get().settings.shortcuts,
          pasteLastTranscript: shortcut,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })

      // Update the global shortcut registration
      await invoke('update_paste_shortcut', { shortcutStr: shortcut })
    } catch (error) {
      console.error('Error saving paste shortcut:', error)
    }
  },

  setGlobalShortcutsEnabled: async (enabled: boolean) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        shortcuts: {
          ...get().settings.shortcuts,
          globalShortcutsEnabled: enabled,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })

      // Enable or disable global shortcuts
      if (enabled) {
        await invoke('enable_global_shortcuts')
      } else {
        await invoke('disable_global_shortcuts')
      }
    } catch (error) {
      console.error('Error toggling global shortcuts:', error)
    }
  },

  setShowInDock: async (enabled: boolean) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        system: {
          ...get().settings.system,
          showInDock: enabled,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })

      // Update dock visibility
      await invoke('set_show_in_dock', { show: enabled })
    } catch (error) {
      console.error('Error toggling show in dock:', error)
    }
  },

  setSaveAudioRecordings: async (enabled: boolean) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        system: {
          ...get().settings.system,
          saveAudioRecordings: enabled,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error toggling save audio recordings:', error)
    }
  },

  setAutoPaste: async (enabled: boolean) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        transcription: {
          ...get().settings.transcription,
          autoPaste: enabled,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error toggling auto-paste:', error)
    }
  },

  setAutoCopyToClipboard: async (enabled: boolean) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        transcription: {
          ...get().settings.transcription,
          autoCopyToClipboard: enabled,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error toggling auto-copy to clipboard:', error)
    }
  },

  setAnalytics: async (enabled: boolean) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        privacy: {
          ...get().settings.privacy,
          analytics: enabled,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error toggling analytics:', error)
    }
  },

  setErrorLogging: async (enabled: boolean) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        privacy: {
          ...get().settings.privacy,
          errorLogging: enabled,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error toggling error logging:', error)
    }
  },

  resetSettings: async () => {
    try {
      const store = await getTauriStore()
      await store.set('settings', defaultSettings)
      await store.save()
      set({ settings: defaultSettings })
    } catch (error) {
      console.error('Error resetting settings:', error)
    }
  },

  setAiProcessingEnabled: async (enabled: boolean) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        aiProcessing: {
          ...get().settings.aiProcessing,
          enabled,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error toggling AI processing:', error)
    }
  },

  setAiProcessingModel: async (modelId: string | null) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        aiProcessing: {
          ...get().settings.aiProcessing,
          modelId,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error setting AI processing model:', error)
    }
  },

  setExpandSnippets: async (enabled: boolean) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        aiProcessing: {
          ...get().settings.aiProcessing,
          expandSnippets: enabled,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error toggling expand snippets:', error)
    }
  },

  setSelectedTranscriptionModel: async (modelId: string | null) => {
    try {
      const store = await getTauriStore()
      const newSettings = {
        ...get().settings,
        transcription: {
          ...get().settings.transcription,
          selectedModelId: modelId,
        },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error setting selected transcription model:', error)
    }
  },
}))

export const initializeSettings = async () => {
  await useSettingsStore.getState().initialize()
}
