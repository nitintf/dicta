import { invoke } from '@tauri-apps/api/core'
import { toast } from 'sonner'

import { initializeModels } from '..'

/**
 * Downloads a Whisper model and auto-selects it
 */
export async function downloadModel(
  modelName: string,
  selectModel: (id: string) => Promise<void>
): Promise<void> {
  const downloadPromise = invoke<string>('download_whisper_model', {
    modelName,
  })

  toast.promise(downloadPromise, {
    loading: `Downloading ${modelName} model...`,
    success: async () => {
      // Reload models to update state
      await initializeModels()

      // Auto-select and start the downloaded model
      const modelId = `whisper-${modelName}`
      await selectModel(modelId)

      return `${modelName} model ready to use!`
    },
    error: error => `Failed to download ${modelName}: ${error}`,
  })
}

/**
 * Deletes a Whisper model
 */
export async function deleteModel(
  modelId: string,
  modelName: string,
  removeModel: (id: string) => Promise<void>
): Promise<void> {
  try {
    await invoke('delete_whisper_model', { modelName })
    toast.success(`${modelName} model deleted`)
    await removeModel(modelId)
    await initializeModels()
  } catch (error) {
    toast.error(`Failed to delete ${modelName}: ${error}`)
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
