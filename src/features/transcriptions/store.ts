import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Transcription, TranscriptionsState } from './types'

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

export const useTranscriptionsStore = create<TranscriptionsState>()(
  persist(
    (set, get) => ({
      transcriptions: [],

      addTranscription: transcription => {
        const newTranscription: Transcription = {
          ...transcription,
          id: generateId(),
          wordCount: countWords(transcription.text),
        }

        set(state => ({
          transcriptions: [newTranscription, ...state.transcriptions],
        }))
      },

      deleteTranscription: id => {
        set(state => ({
          transcriptions: state.transcriptions.filter(t => t.id !== id),
        }))
      },

      clearAll: () => {
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
    }),
    {
      name: 'transcriptions-storage',
      // Don't persist audioBlob as it can't be serialized
      partialize: state => ({
        transcriptions: state.transcriptions.map(t => ({
          ...t,
          audioBlob: undefined,
          audioUrl: undefined,
        })),
      }),
    }
  )
)
