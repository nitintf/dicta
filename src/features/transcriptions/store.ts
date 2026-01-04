import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { create } from 'zustand'

import { Transcription } from './schema'

import type { TranscriptionsStore } from './types'

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
        const transcriptions = await invoke<Transcription[]>(
          'get_all_transcriptions'
        )

        set({
          transcriptions: transcriptions ?? [],
          initialized: true,
        })
      } catch (error) {
        console.error('Error initializing transcriptions store:', error)
        set({ transcriptions: [], initialized: true })
      }
    },

    addTranscription: async transcription => {
      // Note: This is now handled by the Rust backend during transcription
      // We just need to refresh from the recordings folder
      await get().initialize()

      // Return the most recent transcription (should be the one just added)
      const transcriptions = get().transcriptions
      return transcriptions[0] ?? transcription
    },

    deleteTranscription: async id => {
      try {
        // Parse timestamp from id (format: "timestamp-randomstring" or just "timestamp")
        const timestamp = parseInt(id.split('-')[0])

        // Delete from recordings folder via Rust command
        await invoke('delete_recording', { timestamp })

        // Update local state
        const newTranscriptions = get().transcriptions.filter(t => t.id !== id)
        set({ transcriptions: newTranscriptions })
      } catch (error) {
        console.error('Error deleting transcription:', error)
        throw error
      }
    },

    clearAll: async () => {
      try {
        // Delete all recordings
        const transcriptions = get().transcriptions
        for (const transcription of transcriptions) {
          const timestamp = parseInt(transcription.id.split('-')[0])
          await invoke('delete_recording', { timestamp })
        }

        set({ transcriptions: [] })
      } catch (error) {
        console.error('Error clearing transcriptions:', error)
      }
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
