import { Store, load } from '@tauri-apps/plugin-store'
import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'

import type { Snippet, SnippetsStore } from './types'

let tauriStore: Store | null = null

const getTauriStore = async () => {
  if (!tauriStore) {
    tauriStore = await load('snippets.json')
  }
  return tauriStore
}

export const useSnippetsStore = create<SnippetsStore>((set, get) => ({
  snippets: [],
  initialized: false,

  initialize: async () => {
    try {
      const store = await getTauriStore()
      const storedSnippets = await store.get<Snippet[]>('snippets')

      set({
        snippets: storedSnippets || [],
        initialized: true,
      })
    } catch (error) {
      console.error('Error initializing snippets store:', error)
      set({
        snippets: [],
        initialized: true,
      })
    }
  },

  createSnippet: async (snippet: string, expansion: string) => {
    try {
      const store = await getTauriStore()
      const newSnippet: Snippet = {
        id: uuidv4(),
        snippet,
        expansion,
        createdAt: Date.now(),
      }

      const newSnippets = [...get().snippets, newSnippet]
      await store.set('snippets', newSnippets)
      await store.save()
      set({ snippets: newSnippets })
    } catch (error) {
      console.error('Error creating snippet:', error)
      throw error
    }
  },

  updateSnippet: async (id: string, snippet: string, expansion: string) => {
    try {
      const store = await getTauriStore()
      const snippets = get().snippets
      const snippetIndex = snippets.findIndex(s => s.id === id)

      if (snippetIndex === -1) {
        throw new Error('Snippet not found')
      }

      const updatedSnippets = [...snippets]
      updatedSnippets[snippetIndex] = {
        ...updatedSnippets[snippetIndex],
        snippet,
        expansion,
      }

      await store.set('snippets', updatedSnippets)
      await store.save()
      set({ snippets: updatedSnippets })
    } catch (error) {
      console.error('Error updating snippet:', error)
      throw error
    }
  },

  deleteSnippet: async (id: string) => {
    try {
      const store = await getTauriStore()
      const snippets = get().snippets
      const snippet = snippets.find(s => s.id === id)

      if (!snippet) {
        throw new Error('Snippet not found')
      }

      const newSnippets = snippets.filter(s => s.id !== id)
      await store.set('snippets', newSnippets)
      await store.save()
      set({ snippets: newSnippets })
    } catch (error) {
      console.error('Error deleting snippet:', error)
      throw error
    }
  },
}))

export async function initializeSnippets() {
  return useSnippetsStore.getState().initialize()
}
