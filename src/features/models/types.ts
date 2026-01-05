export type ModelType = 'cloud' | 'local'

export type ModelPurpose = 'speech-to-text' | 'post-processing'

export type ModelStatus = 'stopped' | 'loading' | 'ready' | 'error'

export type ModelProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'assemblyai'
  | 'elevenlabs'
  | 'ollama'
  | 'lmstudio'
  | 'local-whisper'

export interface ModelCapabilities {
  accuracy: 'high' | 'medium' | 'low'
  speed: 'fast' | 'medium' | 'slow'
  languages: number // Number of supported languages
  features: string[] // e.g., ["speaker detection", "timestamps", "word-level"]
  bestFor: string[] // Best use cases
}

export interface TranscriptionModel {
  id: string
  name: string
  provider: ModelProvider
  type: ModelType
  purpose: ModelPurpose
  engine?: string
  size?: string
  requiresApiKey: boolean
  hasApiKey?: boolean
  apiKey?: string
  isSelected: boolean
  isDownloaded?: boolean
  path?: string
  description?: string
  status?: ModelStatus
  capabilities?: ModelCapabilities
  downloadUrl?: string
  filename?: string
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
