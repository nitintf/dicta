import { Store, load } from '@tauri-apps/plugin-store'
import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'

import type { VocabularyWord } from './schema'
import type { VocabularyStore } from './types'

let tauriStore: Store | null = null

const getTauriStore = async () => {
  if (!tauriStore) {
    tauriStore = await load('vocabulary.json')
  }
  return tauriStore
}

export const useVocabularyStore = create<VocabularyStore>((set, get) => ({
  words: [],
  initialized: false,

  initialize: async () => {
    try {
      const store = await getTauriStore()
      const storedWords = await store.get<VocabularyWord[]>('words')

      set({
        words: storedWords || [],
        initialized: true,
      })
    } catch (error) {
      console.error('Error initializing vocabulary store:', error)
      set({
        words: [],
        initialized: true,
      })
    }
  },

  addWord: async (word: string) => {
    try {
      const store = await getTauriStore()

      // Check if word already exists (case-insensitive)
      const existingWord = get().words.find(
        w => w.word.toLowerCase() === word.toLowerCase()
      )

      if (existingWord) {
        throw new Error('This word already exists in your vocabulary')
      }

      const newWord: VocabularyWord = {
        id: uuidv4(),
        word,
        createdAt: Date.now(),
      }

      const newWords = [...get().words, newWord]
      await store.set('words', newWords)
      await store.save()
      set({ words: newWords })
    } catch (error) {
      console.error('Error adding word:', error)
      throw error
    }
  },

  updateWord: async (id: string, word: string) => {
    try {
      const store = await getTauriStore()
      const words = get().words
      const wordIndex = words.findIndex(w => w.id === id)

      if (wordIndex === -1) {
        throw new Error('Word not found')
      }

      // Check if updated word already exists (case-insensitive, excluding current)
      const existingWord = words.find(
        (w, idx) =>
          idx !== wordIndex && w.word.toLowerCase() === word.toLowerCase()
      )

      if (existingWord) {
        throw new Error('This word already exists in your vocabulary')
      }

      const updatedWords = [...words]
      updatedWords[wordIndex] = {
        ...updatedWords[wordIndex],
        word,
      }

      await store.set('words', updatedWords)
      await store.save()
      set({ words: updatedWords })
    } catch (error) {
      console.error('Error updating word:', error)
      throw error
    }
  },

  deleteWord: async (id: string) => {
    try {
      const store = await getTauriStore()
      const words = get().words
      const word = words.find(w => w.id === id)

      if (!word) {
        throw new Error('Word not found')
      }

      const newWords = words.filter(w => w.id !== id)
      await store.set('words', newWords)
      await store.save()
      set({ words: newWords })
    } catch (error) {
      console.error('Error deleting word:', error)
      throw error
    }
  },
}))

export async function initializeVocabulary() {
  return useVocabularyStore.getState().initialize()
}
