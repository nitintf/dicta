import { listen } from '@tauri-apps/api/event'
import { Store, load } from '@tauri-apps/plugin-store'
import { create } from 'zustand'

import { Transcription } from './schema'

import type { TranscriptionsStore } from './types'

let tauriStore: Store | null = null

const getTauriStore = async () => {
  if (!tauriStore) {
    tauriStore = await load('transcriptions.json')
  }
  return tauriStore
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function isToday(timestamp: number): boolean {
  const today = new Date()
  const date = new Date(timestamp)
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export const useTranscriptionsStore = create<TranscriptionsStore>(
  (set, get) => ({
    transcriptions: [],
    initialized: false,

    initialize: async () => {
      try {
        const store = await getTauriStore()
        const storedTranscriptions =
          await store.get<Transcription[]>('transcriptions')

        set({
          transcriptions: storedTranscriptions ?? [],
          initialized: true,
        })
      } catch (error) {
        console.error('Error initializing transcriptions store:', error)
        set({ transcriptions: [], initialized: true })
      }
    },

    addTranscription: async transcription => {
      const newTranscription: Transcription = {
        ...transcription,
        id: generateId(),
        wordCount: countWords(transcription.text),
      }

      const newTranscriptions = [newTranscription, ...get().transcriptions]

      // Save to Tauri store (automatically syncs across windows)
      try {
        const store = await getTauriStore()
        // Don't persist audioBlob as it can't be serialized
        const serializable = newTranscriptions.map(t => ({
          ...t,
          audioBlob: undefined,
          audioUrl: undefined,
        }))
        await store.set('transcriptions', serializable)
        await store.save()
      } catch (error) {
        console.error('Error saving transcription:', error)
      }

      set({ transcriptions: newTranscriptions })
      return newTranscription
    },

    deleteTranscription: async id => {
      const newTranscriptions = get().transcriptions.filter(t => t.id !== id)

      try {
        const store = await getTauriStore()
        const serializable = newTranscriptions.map(t => ({
          ...t,
          audioBlob: undefined,
          audioUrl: undefined,
        }))
        await store.set('transcriptions', serializable)
        await store.save()
      } catch (error) {
        console.error('Error deleting transcription:', error)
      }

      set({ transcriptions: newTranscriptions })
    },

    clearAll: async () => {
      try {
        const store = await getTauriStore()
        await store.set('transcriptions', [])
        await store.save()
      } catch (error) {
        console.error('Error clearing transcriptions:', error)
      }

      set({ transcriptions: [] })
    },

    getStats: () => {
      const transcriptions = get().transcriptions
      return {
        totalTranscriptions: transcriptions.length,
        totalWords: transcriptions.reduce((sum, t) => sum + t.wordCount, 0),
        todayCount: transcriptions.filter(t => isToday(t.timestamp)).length,
      }
    },
  })
)

export const initializeTranscriptions = async () => {
  await useTranscriptionsStore.getState().initialize()
}

// Set up listener for changes from other windows
export const setupTranscriptionsSync = () => {
  listen('transcriptions-changed', async () => {
    // Reload from Tauri store when another window makes changes
    await useTranscriptionsStore.getState().initialize()
  })
}
