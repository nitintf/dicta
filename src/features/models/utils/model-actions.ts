import { invoke } from '@tauri-apps/api/core'
import { toast } from 'sonner'

import { initializeModels } from '..'

import type { TranscriptionModel } from '../types'

/**
 * Downloads a local model and auto-selects it
 */
export async function downloadModel(
  model: TranscriptionModel,
  selectModel: (id: string) => Promise<void>
): Promise<void> {
  if (!model.downloadUrl || !model.filename || !model.engine) {
    toast.error('Invalid model configuration')
    return
  }

  const downloadPromise = invoke<string>('download_local_model', {
    modelId: model.id,
    downloadUrl: model.downloadUrl,
    filename: model.filename,
    engineType: model.engine,
  })

  toast.promise(downloadPromise, {
    loading: `Downloading ${model.name} model...`,
    success: async () => {
      // Reload models to update state
      await initializeModels()

      // Auto-select and start the downloaded model
      await selectModel(model.id)

      return `${model.name} model ready to use!`
    },
    error: error => `Failed to download ${model.name}: ${error}`,
  })
}

/**
 * Deletes a local model
 */
export async function deleteModel(model: TranscriptionModel): Promise<void> {
  if (!model.path) {
    toast.error('Model path not found')
    return
  }

  try {
    await invoke('delete_local_model', { modelPath: model.path })
    toast.success(`${model.name} model deleted`)
    await initializeModels()
  } catch (error) {
    toast.error(`Failed to delete ${model.name}: ${error}`)
    throw error
  }
}

/**
 * Syncs models with default configuration
 */
export async function syncModels(
  syncDefaultModels: () => Promise<void>
): Promise<void> {
  const syncPromise = syncDefaultModels()

  toast.promise(syncPromise, {
    loading: 'Syncing models...',
    success: 'Models synced successfully!',
    error: error => `Failed to sync models: ${error}`,
  })
}
