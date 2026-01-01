import { invoke } from '@tauri-apps/api/core'
import { Store, load } from '@tauri-apps/plugin-store'
import { create } from 'zustand'

import { defaultSettings } from './types'

import type { Settings, SettingsStore } from './types'

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
        },
        shortcuts: {
          pasteLastTranscript:
            storedSettings?.shortcuts?.pasteLastTranscript ??
            'CmdOrCtrl+Shift+V',
          globalShortcutsEnabled:
            storedSettings?.shortcuts?.globalShortcutsEnabled ?? true,
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
}))

export const initializeSettings = async () => {
  await useSettingsStore.getState().initialize()
}
