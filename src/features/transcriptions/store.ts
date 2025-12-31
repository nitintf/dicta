import { emit, listen } from '@tauri-apps/api/event'
import { isEqual } from 'lodash-es'
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

const useTranscriptionsStore = create<TranscriptionsState>()(
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

        return newTranscription
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

// --- STATE SYNCHRONIZATION LOGIC ---

/**
 * This flag prevents an infinite loop of updates. When a window receives an
 * update from another window, it sets this flag to `true` before applying
 * the new state. This ensures that the `subscribe` function below doesn't
 * immediately re-broadcast the same state change it just received.
 */
let isProcessingUpdate = false

/**
 * PHASE 1: BROADCASTING STATE CHANGES
 *
 * This function runs every time the state in the current window changes.
 * It sends the new state to all other windows.
 */
useTranscriptionsStore.subscribe((currentState, previousState) => {
  console.log('Updating the state!!!')
  if (isProcessingUpdate) {
    return
  }

  // We use `isEqual` for a deep comparison to avoid unnecessary updates
  // for objects and arrays, which might otherwise trigger a change even
  // if their contents are identical.
  if (!isEqual(currentState, previousState)) {
    emit('store-update', currentState)
  }
})

/**
 * PHASE 2: LISTENING FOR STATE CHANGES
 *
 * This listener runs whenever another window broadcasts a 'store-update' event.
 * It receives the new state and updates the current window's store.
 */
listen('store-update', event => {
  const newState = event.payload

  if (!isEqual(useTranscriptionsStore.getState(), newState)) {
    isProcessingUpdate = true
    // Here we could do deep merging,
    // but for the sake of simplicity,
    // we just replace the state
    useTranscriptionsStore.setState(newState as TranscriptionsState)
    isProcessingUpdate = false
  }
})

/**
 * PHASE 3: INITIAL STATE HYDRATION FOR NEW WINDOWS
 *
 * This logic ensures that when a new window opens, it gets the most
 * up-to-date state from an existing window.
 */

// A flag to ensure we only hydrate the state once on initial load.
let hasHydrated = false

// When a new window opens, it immediately requests the current state.
emit('get-store-request')

// Existing windows will listen for this request and respond with their current state.
listen('get-store-request', () => {
  emit('get-store-response', {
    state: useTranscriptionsStore.getState(),
  })
})

// The new window listens for the response and hydrates its own state.
listen<{ state: TranscriptionsState }>('get-store-response', event => {
  if (!hasHydrated) {
    const newState = event.payload.state

    // We set the processing flag here as well to prevent the `subscribe`
    // function from immediately broadcasting this initial state.
    isProcessingUpdate = true
    useTranscriptionsStore.setState(newState)
    isProcessingUpdate = false
    hasHydrated = true
  }
})

export { useTranscriptionsStore }
