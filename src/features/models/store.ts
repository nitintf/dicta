import { invoke } from '@tauri-apps/api/core'
import { listen, emit } from '@tauri-apps/api/event'
import { Store, load } from '@tauri-apps/plugin-store'
import { toast } from 'sonner'
import { create } from 'zustand'

import { useSettingsStore } from '../settings/store'
import {
  getLocalModelStatus,
  startLocalModel as startLocalModelCommand,
  stopLocalModel as stopLocalModelCommand,
} from './utils/local-model-actions'

import type { TranscriptionModel, ModelsState, ModelStatus } from './types'

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

  initialize: async () => {
    try {
      const store = await getTauriStore()
      const storedModels = await store.get<TranscriptionModel[]>('models')

      // Get settings to determine selected models
      const settings = useSettingsStore.getState().settings
      const selectedSpeechToTextId = settings.transcription.speechToTextModelId
      const selectedPostProcessingId =
        settings.aiProcessing.postProcessingModelId

      // Get all models from Rust with latest status
      const defaultModels = await getDefaultModels()

      let modelsToUse: TranscriptionModel[]

      if (!storedModels || storedModels.length === 0) {
        // First time - use defaults from Rust
        modelsToUse = defaultModels.map(model => ({
          ...model,
          isSelected:
            (model.purpose === 'speech-to-text' &&
              model.id === selectedSpeechToTextId) ||
            (model.purpose === 'post-processing' &&
              model.id === selectedPostProcessingId),
        }))
      } else {
        // Merge: use Rust data but preserve user settings (API keys)
        modelsToUse = await Promise.all(
          defaultModels.map(async rustModel => {
            const storedModel = storedModels.find(m => m.id === rustModel.id)

            // Check if this model has an API key in secure storage
            let hasApiKey = false
            if (rustModel.requiresApiKey) {
              try {
                hasApiKey = await invoke<boolean>('has_api_key', {
                  modelId: rustModel.id,
                })
              } catch {
                hasApiKey = false
              }
            }

            // Determine selection based on settings
            const isSelected =
              (rustModel.purpose === 'speech-to-text' &&
                rustModel.id === selectedSpeechToTextId) ||
              (rustModel.purpose === 'post-processing' &&
                rustModel.id === selectedPostProcessingId)

            if (storedModel) {
              return {
                ...rustModel,
                isSelected,
                hasApiKey,
                ...(storedModel.apiKey ? { apiKey: storedModel.apiKey } : {}),
              }
            }

            return { ...rustModel, hasApiKey, isSelected }
          })
        )

        // Add any custom models that aren't in defaults
        const customModels = storedModels.filter(
          m => !defaultModels.find(dm => dm.id === m.id)
        )
        modelsToUse = [...modelsToUse, ...customModels]
      }

      // Check runtime status for all local models
      const modelsWithStatus = await Promise.all(
        modelsToUse.map(async model => {
          if (model.type === 'local' && model.isDownloaded) {
            try {
              const statusInfo = await invoke<{ status: string }>(
                'get_local_model_status',
                {
                  modelId: model.id,
                }
              )
              return { ...model, status: statusInfo.status as ModelStatus }
            } catch {
              return model
            }
          }
          return model
        })
      )

      await store.set('models', modelsWithStatus)
      await store.save()

      set({ models: modelsWithStatus, initialized: true })
    } catch (error) {
      console.error('Error initializing models store:', error)
      set({ models: [], initialized: true })
    }
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
    try {
      // Store the API key securely using Tauri command
      // This also sets hasApiKey: true in the backend
      await invoke('store_api_key', { modelId: id, apiKey })

      // Reload models from store to get updated data
      const store = await getTauriStore()
      const updatedModels = await store.get<TranscriptionModel[]>('models')
      if (updatedModels) {
        set({ models: updatedModels })
      }
    } catch (error) {
      console.error('Failed to store API key:', error)
      throw error
    }
  },

  removeApiKey: async id => {
    try {
      // Remove the API key from secure storage
      // This also sets hasApiKey: false in the backend
      await invoke('remove_api_key', { modelId: id })

      // Reload models from store to get updated data
      const store = await getTauriStore()
      const updatedModels = await store.get<TranscriptionModel[]>('models')
      if (updatedModels) {
        set({ models: updatedModels })
      }
    } catch (error) {
      console.error('Failed to remove API key:', error)
      throw error
    }
  },

  selectModel: async id => {
    const currentModels = get().models
    const newModel = currentModels.find(m => m.id === id)

    if (!newModel) {
      toast.error('Model not found')
      return
    }

    // Find the previously selected model of the SAME purpose
    const previousModel = currentModels.find(
      m => m.isSelected && m.purpose === newModel.purpose
    )

    // Validate cloud models have API key
    if (
      newModel.type === 'cloud' &&
      newModel.requiresApiKey &&
      !newModel.hasApiKey
    ) {
      toast.error('API key required', {
        description: `Please add an API key for ${newModel.name} before selecting it.`,
        duration: 4000,
      })
      return
    }

    // Validate local models are downloaded
    if (newModel.type === 'local' && !newModel.isDownloaded) {
      toast.error('Model not downloaded', {
        description: `Please download ${newModel.name} before selecting it.`,
        duration: 4000,
      })
      return
    }

    // Stop previous local model if switching away (only for speech-to-text models)
    if (
      previousModel?.type === 'local' &&
      previousModel.id !== id &&
      newModel.purpose === 'speech-to-text'
    ) {
      try {
        await invoke('stop_whisper_model')
      } catch (error) {
        console.error('Failed to stop previous model:', error)
      }
    }

    // Deselect only models with the SAME purpose, then select the new one
    const newModels = currentModels.map(model => ({
      ...model,
      isSelected:
        model.id === id
          ? true
          : model.purpose === newModel.purpose
            ? false
            : model.isSelected,
      // Set status to stopped if it was the previous model
      status:
        model.id === previousModel?.id && previousModel?.type === 'local'
          ? ('stopped' as ModelStatus)
          : model.status,
    }))

    try {
      const store = await getTauriStore()
      await store.set('models', newModels)
      await store.save()

      // Update settings store with the selected model
      const settingsStore = useSettingsStore.getState()
      if (newModel.purpose === 'speech-to-text') {
        await settingsStore.setSpeechToTextModel(id)
      } else if (newModel.purpose === 'post-processing') {
        await settingsStore.setPostProcessingModel(id)
      }

      // Notify other windows to reload
      await emit('models-changed')
    } catch (error) {
      console.error('Error selecting model:', error)
    }

    set({ models: newModels })

    // Auto-start new local model if it's downloaded
    if (newModel?.type === 'local' && newModel.isDownloaded && newModel.path) {
      await get().startLocalModel(id)
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
    if (!model || model.type !== 'local' || !model.path || !model.engine) {
      throw new Error('Invalid model for starting')
    }

    // Extract model name from ID (e.g., "whisper-base" -> "base")
    const modelName = model.id.replace('whisper-', '')

    try {
      await startLocalModelCommand(id, modelName, model.path, model.engine)

      // Verify the model actually started by checking status after a delay
      setTimeout(async () => {
        try {
          const statusInfo = await getLocalModelStatus(id)

          const models = get().models.map(m =>
            m.id === id ? { ...m, status: statusInfo.status } : m
          )
          set({ models })
        } catch (err) {
          console.error('Failed to verify model status:', err)
        }
      }, 2000)
    } catch (error) {
      console.error('Failed to start model:', error)
      throw error
    }
  },

  stopLocalModel: async id => {
    try {
      await stopLocalModelCommand()

      toast.success('Model stopped', {
        description: 'Model has been unloaded from memory.',
        duration: 3000,
      })

      const models = get().models.map(m =>
        m.id === id ? { ...m, status: 'stopped' as ModelStatus } : m
      )
      set({ models })
    } catch (error) {
      toast.error('Failed to stop model', {
        description: 'The model may have already stopped or crashed.',
        duration: 5000,
      })
      console.error('Failed to stop model:', error)
      throw error
    }
  },

  refreshModelStatus: async id => {
    try {
      const statusInfo = await getLocalModelStatus(id)

      // Also update the model's status field
      const models = get().models.map(m =>
        m.id === id ? { ...m, status: statusInfo.status } : m
      )
      set({ models })

      return statusInfo.status
    } catch (error) {
      console.error('Failed to refresh model status:', error)
      throw error
    }
  },
}))

export const initializeModels = async () => {
  await useModelsStore.getState().initialize()
}

export const initializeUserFirstLaunch = async () => {}

export const initializeModelStatusListener = () => {
  // Listen for new generic local model status events
  listen<{
    status: ModelStatus
    modelName: string | null
    modelId: string | null
  }>('local-model-status', event => {
    const { status, modelId } = event.payload

    if (modelId) {
      useModelsStore.setState(state => {
        // Also update the model's status field
        const models = state.models.map(m =>
          m.id === modelId ? { ...m, status } : m
        )

        return { models }
      })
    }
  })
}
