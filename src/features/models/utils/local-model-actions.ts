import { invoke } from '@tauri-apps/api/core'
import { toast } from 'sonner'

import type { ModelStatus } from '../types'

/**
 * Status information for a local model
 */
export interface LocalModelStatusInfo {
  status: ModelStatus
  modelName: string | null
  modelId: string | null
}

/**
 * Starts (loads) a local model into memory
 *
 * @param modelId - The model identifier
 * @param modelName - The model name
 * @param modelPath - The full path to the model file
 */
export async function startLocalModel(
  modelId: string,
  modelName: string,
  modelPath: string
): Promise<void> {
  try {
    await invoke('start_local_model', {
      modelId,
      modelName,
      modelPath,
    })

    toast.success('Model started', {
      description: 'Model is now loaded into memory and ready to use.',
      duration: 3000,
    })
  } catch (error) {
    const errorMsg = String(error)

    // Provide helpful error messages with recovery steps
    if (errorMsg.includes('memory') || errorMsg.includes('allocation')) {
      toast.error('Out of memory', {
        description:
          'Try a smaller model (tiny or base) or restart the app to free up memory.',
        duration: 6000,
      })
    } else if (
      errorMsg.includes('not found') ||
      errorMsg.includes('No such file')
    ) {
      toast.error('Model file not found', {
        description:
          'The model file may be corrupted. Try: 1) Stop the model, 2) Remove it, 3) Download again.',
        duration: 8000,
      })
    } else if (
      errorMsg.includes('already loaded') ||
      errorMsg.includes('in use')
    ) {
      toast.error('Model already running', {
        description: 'Stop the model first, then try starting it again.',
        duration: 5000,
      })
    } else {
      toast.error('Failed to start model', {
        description: `Error: ${errorMsg}. Try: 1) Refresh status, 2) Stop and restart, 3) Remove and re-download.`,
        duration: 8000,
      })
    }
    throw error
  }
}

/**
 * Stops (unloads) the current local model from memory
 */
export async function stopLocalModel(): Promise<void> {
  await invoke('stop_local_model')
}

/**
 * Gets the current status of a local model
 *
 * @param modelId - Optional model ID to check status for
 */
export async function getLocalModelStatus(
  modelId?: string
): Promise<LocalModelStatusInfo> {
  return invoke<LocalModelStatusInfo>('get_local_model_status', {
    modelId: modelId || null,
  })
}
