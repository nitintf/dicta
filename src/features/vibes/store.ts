import { Store, load } from '@tauri-apps/plugin-store'
import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'

import { defaultVibes, type VibesStore } from './types'

import type { Vibe, VibeCategory } from './schema'

let tauriStore: Store | null = null

const getTauriStore = async () => {
  if (!tauriStore) {
    tauriStore = await load('vibes.json')
  }
  return tauriStore
}

export const useVibesStore = create<VibesStore>((set, get) => ({
  vibes: defaultVibes,
  selectedVibes: {
    personal: 'personal-relaxed',
    work: 'work-executive',
    email: 'email-professional',
    other: 'other-raw',
  },
  initialized: false,

  initialize: async () => {
    try {
      const store = await getTauriStore()
      const storedVibes = await store.get<Vibe[]>('vibes')
      const storedSelectedVibes =
        await store.get<Record<VibeCategory, string | null>>('selectedVibes')

      // Default selected vibes
      const defaultSelectedVibes: Record<VibeCategory, string | null> = {
        personal: 'personal-relaxed',
        work: 'work-executive',
        email: 'email-professional',
        other: 'other-raw',
      }

      // If no stored vibes, persist defaults to storage
      if (!storedVibes || storedVibes.length === 0) {
        await store.set('vibes', defaultVibes)
        await store.set('selectedVibes', defaultSelectedVibes)
        await store.save()
        set({
          vibes: defaultVibes,
          selectedVibes: defaultSelectedVibes,
          initialized: true,
        })
      } else {
        set({
          vibes: storedVibes,
          selectedVibes: storedSelectedVibes ?? defaultSelectedVibes,
          initialized: true,
        })
      }
    } catch (error) {
      console.error('Error initializing vibes store:', error)
      set({
        vibes: defaultVibes,
        selectedVibes: {
          personal: 'personal-relaxed',
          work: 'work-executive',
          email: 'email-professional',
          other: 'other-raw',
        },
        initialized: true,
      })
    }
  },

  createVibe: async (
    name: string,
    description: string,
    prompt: string,
    category: VibeCategory,
    example?: string
  ) => {
    try {
      const store = await getTauriStore()
      const newVibe: Vibe = {
        id: uuidv4(),
        name,
        description,
        prompt,
        ...(example && { example }),
        category,
        isDefault: false,
        createdAt: Date.now(),
      }

      const newVibes = [...get().vibes, newVibe]
      await store.set('vibes', newVibes)
      await store.save()
      set({ vibes: newVibes })
    } catch (error) {
      console.error('Error creating vibe:', error)
      throw error
    }
  },

  updateVibe: async (
    id: string,
    name: string,
    description: string,
    prompt: string,
    example?: string
  ) => {
    try {
      const store = await getTauriStore()
      const vibes = get().vibes
      const vibeIndex = vibes.findIndex(s => s.id === id)

      if (vibeIndex === -1) {
        throw new Error('Vibe not found')
      }

      // Don't allow editing default vibes
      if (vibes[vibeIndex].isDefault) {
        throw new Error('Cannot edit default vibes')
      }

      const updatedVibes = [...vibes]
      updatedVibes[vibeIndex] = {
        ...updatedVibes[vibeIndex],
        name,
        description,
        prompt,
        ...(example !== undefined && { example }),
      }

      await store.set('vibes', updatedVibes)
      await store.save()
      set({ vibes: updatedVibes })
    } catch (error) {
      console.error('Error updating vibe:', error)
      throw error
    }
  },

  deleteVibe: async (id: string) => {
    try {
      const store = await getTauriStore()
      const vibes = get().vibes
      const vibe = vibes.find(s => s.id === id)

      if (!vibe) {
        throw new Error('Vibe not found')
      }

      // Don't allow deleting default vibes
      if (vibe.isDefault) {
        throw new Error('Cannot delete default vibes')
      }

      const newVibes = vibes.filter(s => s.id !== id)
      await store.set('vibes', newVibes)
      await store.save()

      // If deleted vibe was selected in its category, switch to first default in that category
      const selectedVibes = get().selectedVibes
      if (selectedVibes[vibe.category] === id) {
        const firstDefaultInCategory = defaultVibes.find(
          ds => ds.category === vibe.category
        )
        if (firstDefaultInCategory) {
          await get().selectVibeForCategory(
            vibe.category,
            firstDefaultInCategory.id
          )
        }
      }

      set({ vibes: newVibes })
    } catch (error) {
      console.error('Error deleting vibe:', error)
      throw error
    }
  },

  selectVibeForCategory: async (
    category: VibeCategory,
    vibeId: string | null
  ) => {
    try {
      const store = await getTauriStore()
      const newSelectedVibes = {
        ...get().selectedVibes,
        [category]: vibeId,
      }
      await store.set('selectedVibes', newSelectedVibes)
      await store.save()
      set({ selectedVibes: newSelectedVibes })
    } catch (error) {
      console.error('Error selecting vibe:', error)
      throw error
    }
  },
}))

export async function initializeVibes() {
  return useVibesStore.getState().initialize()
}
