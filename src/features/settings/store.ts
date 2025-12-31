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
        voiceInput: { shortcut },
      }
      await store.set('settings', newSettings)
      await store.save()
      set({ settings: newSettings })
    } catch (error) {
      console.error('Error saving voice input shortcut:', error)
    }
  },
}))

export const initializeSettings = async () => {
  await useSettingsStore.getState().initialize()
}
