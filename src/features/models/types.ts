// Import generated types from Rust
import type { ModelDefinition as GeneratedModelDefinition } from './types/generated'

// Re-export generated types
export type { ModelType, ModelPurpose, ModelProvider } from './types/generated'

// Re-export ModelDefinition for direct use
export type { ModelDefinition } from './types/generated'

// Additional frontend-only types
export type ModelStatus = 'stopped' | 'loading' | 'ready' | 'error'

export interface ModelCapabilities {
  accuracy: 'high' | 'medium' | 'low'
  speed: 'fast' | 'medium' | 'slow'
  languages: number // Number of supported languages
  features: string[] // e.g., ["speaker detection", "timestamps", "word-level"]
  bestFor: string[] // Best use cases
}

// Extended model type with frontend-specific fields
export interface TranscriptionModel extends GeneratedModelDefinition {
  hasApiKey?: boolean
  apiKey?: string
  status?: ModelStatus
  capabilities?: ModelCapabilities
}

export interface ModelStatusInfo {
  status: ModelStatus
  modelName: string | null
}

export interface ModelsState {
  models: TranscriptionModel[]
  initialized: boolean
  initialize: () => Promise<void>
  addModel: (model: Omit<TranscriptionModel, 'id'>) => Promise<void>
  updateModel: (
    id: string,
    updates: Partial<TranscriptionModel>
  ) => Promise<void>
  removeModel: (id: string) => Promise<void>
  setApiKey: (id: string, apiKey: string) => Promise<void>
  removeApiKey: (id: string) => Promise<void>
  selectModel: (id: string) => Promise<void>
  syncDefaultModels: () => Promise<void>
  startLocalModel: (id: string) => Promise<void>
  stopLocalModel: (id: string) => Promise<void>
  refreshModelStatus: (id: string) => Promise<ModelStatus>
}
