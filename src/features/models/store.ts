import { invoke } from '@tauri-apps/api/core'
import { listen, emit } from '@tauri-apps/api/event'
import { Store, load } from '@tauri-apps/plugin-store'
import { create } from 'zustand'

import type {
  TranscriptionModel,
  ModelsState,
  ModelStatusInfo,
  ModelStatus,
} from './types'

let tauriStore: Store | null = null

const getTauriStore = async () => {
  if (!tauriStore) {
    tauriStore = await load('models.json')
  }
  return tauriStore
}

// Fetch all models from Rust (single source of truth)
async function getDefaultModels(): Promise<TranscriptionModel[]> {
  try {
    const models = await invoke<TranscriptionModel[]>('get_all_models')
    return models
  } catch (error) {
    console.error('Failed to fetch models from Rust:', error)
    // Return empty array if Rust fails - should never happen
    return []
  }
}

export const useModelsStore = create<ModelsState>((set, get) => ({
  models: [],
  initialized: false,
  modelStatuses: new Map<string, ModelStatus>(),

  initialize: async () => {
    try {
      const store = await getTauriStore()
      const storedModels = await store.get<TranscriptionModel[]>('models')

      // Get all models from Rust with latest status
      const defaultModels = await getDefaultModels()

      let modelsToUse: TranscriptionModel[]

      if (!storedModels || storedModels.length === 0) {
        // First time - use defaults from Rust
        modelsToUse = defaultModels
      } else {
        // Merge: use Rust data but preserve user settings (API keys, selection)
        modelsToUse = defaultModels.map(rustModel => {
          const storedModel = storedModels.find(m => m.id === rustModel.id)

          if (storedModel) {
            // Keep user settings, but use Rust's download status
            return {
              ...rustModel,
              isSelected: storedModel.isSelected,
              isEnabled: storedModel.isEnabled,
              apiKey: storedModel.apiKey, // Preserve API key
            }
          }

          return rustModel
        })

        // Add any custom models that aren't in defaults
        const customModels = storedModels.filter(
          m => !defaultModels.find(dm => dm.id === m.id)
        )
        modelsToUse = [...modelsToUse, ...customModels]
      }

      // Save the synced models
      await store.set('models', modelsToUse)
      await store.save()

      set({ models: modelsToUse, initialized: true })

      // Auto-start selected local whisper model on app startup
      const selectedModel = modelsToUse.find(m => m.isSelected)
      if (
        selectedModel?.provider === 'local-whisper' &&
        selectedModel.isDownloaded &&
        selectedModel.path
      ) {
        try {
          const modelName = selectedModel.id.replace('whisper-', '')
          await invoke('start_whisper_model', {
            modelName,
            modelPath: selectedModel.path,
          })
          console.log('Auto-started local model:', selectedModel.name)
        } catch (error) {
          console.error('Failed to auto-start local model on startup:', error)
        }
      }
    } catch (error) {
      console.error('Error initializing models store:', error)
      set({ models: [], initialized: true })
    }
  },

  initActiveModel: async () => {
    const store = await getTauriStore()
    const activeModel = get().models.find(m => m.isSelected && m.isEnabled)

    if (activeModel) {
      await store.set('activeModel', activeModel)
      await store.save()
    }

    return activeModel
  },

  addModel: async model => {
    const newModel: TranscriptionModel = {
      ...model,
      id: `${model.provider}-${Date.now()}`,
    }

    const newModels = [...get().models, newModel]

    try {
      const store = await getTauriStore()
      await store.set('models', newModels)
      await store.save()
    } catch (error) {
      console.error('Error adding model:', error)
    }

    set({ models: newModels })
  },

  updateModel: async (id, updates) => {
    const newModels = get().models.map(model =>
      model.id === id ? { ...model, ...updates } : model
    )

    try {
      const store = await getTauriStore()
      await store.set('models', newModels)
      await store.save()

      // Notify other windows to reload
      await emit('models-changed')
    } catch (error) {
      console.error('Error updating model:', error)
    }

    set({ models: newModels })
  },

  removeModel: async id => {
    const newModels = get().models.filter(model => model.id !== id)

    try {
      const store = await getTauriStore()
      await store.set('models', newModels)
      await store.save()
    } catch (error) {
      console.error('Error removing model:', error)
    }

    set({ models: newModels })
  },

  setApiKey: async (id, apiKey) => {
    await get().updateModel(id, { apiKey })
  },

  removeApiKey: async id => {
    await get().updateModel(id, { apiKey: undefined })
  },

  selectModel: async id => {
    const currentModels = get().models
    const previousModel = currentModels.find(m => m.isSelected)
    const newModel = currentModels.find(m => m.id === id)

    // Stop previous local whisper model if switching away
    if (
      previousModel?.provider === 'local-whisper' &&
      previousModel.id !== id
    ) {
      try {
        await invoke('stop_whisper_model')

        // Update status to stopped
        const statuses = new Map(get().modelStatuses)
        statuses.set(previousModel.id, 'stopped')
        set({ modelStatuses: statuses })
      } catch (error) {
        console.error('Failed to stop previous model:', error)
      }
    }

    // Deselect all models and update status
    const newModels = currentModels.map(model => ({
      ...model,
      isSelected: model.id === id,
      // Set status to stopped if it was the previous model
      status:
        model.id === previousModel?.id &&
        previousModel?.provider === 'local-whisper'
          ? ('stopped' as ModelStatus)
          : model.status,
    }))

    try {
      const store = await getTauriStore()
      await store.set('models', newModels)
      await store.save()

      // Notify other windows to reload
      await emit('models-changed')
    } catch (error) {
      console.error('Error selecting model:', error)
    }

    set({ models: newModels })

    // Auto-start new local whisper model if it's downloaded
    if (
      newModel?.provider === 'local-whisper' &&
      newModel.isDownloaded &&
      newModel.path
    ) {
      await get().startLocalModel(id)
    }
  },

  toggleEnabled: async id => {
    const model = get().models.find(m => m.id === id)
    if (model) {
      await get().updateModel(id, { isEnabled: !model.isEnabled })
    }
  },

  syncDefaultModels: async () => {
    try {
      const defaultModels = await getDefaultModels()
      const store = await getTauriStore()
      await store.set('models', defaultModels)
      await store.save()
      set({ models: defaultModels })
      console.log('✅ Default models synced successfully')
    } catch (error) {
      console.error('Error syncing default models:', error)
      throw error
    }
  },

  startLocalModel: async id => {
    const model = get().models.find(m => m.id === id)
    if (!model || model.provider !== 'local-whisper' || !model.path) {
      throw new Error('Invalid model for starting')
    }

    // Extract model name from ID (e.g., "whisper-base" -> "base")
    const modelName = model.id.replace('whisper-', '')

    try {
      await invoke('start_whisper_model', {
        modelName,
        modelPath: model.path,
      })
    } catch (error) {
      console.error('Failed to start model:', error)
      throw error
    }
  },

  stopLocalModel: async id => {
    try {
      await invoke('stop_whisper_model')

      // Update status
      const statuses = new Map(get().modelStatuses)
      statuses.set(id, 'stopped')
      set({ modelStatuses: statuses })
    } catch (error) {
      console.error('Failed to stop model:', error)
      throw error
    }
  },

  getModelStatus: id => {
    return get().modelStatuses.get(id) || 'stopped'
  },
}))

export const initializeModels = async () => {
  await useModelsStore.getState().initialize()
}

// Initialize model status listener
export const initializeModelStatusListener = () => {
  listen<ModelStatusInfo>('whisper-model-status', event => {
    const { status, modelName } = event.payload

    if (modelName) {
      const modelId = `whisper-${modelName}`
      useModelsStore.setState(state => {
        const statuses = new Map(state.modelStatuses)
        statuses.set(modelId, status)

        // Also update the model's status field
        const models = state.models.map(m =>
          m.id === modelId ? { ...m, status } : m
        )

        return { modelStatuses: statuses, models }
      })
    }
  })
}

// Set up sync between windows for model selection changes
export const setupModelsSync = () => {
  listen('models-changed', async () => {
    // Reload from Tauri store when another window makes changes
    await useModelsStore.getState().initialize()
  })
}
