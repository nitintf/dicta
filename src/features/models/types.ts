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
  purpose: ModelPurpose // What this model is used for
  engine?: string // Engine type for local models (e.g., "whisper", "llama")
  size?: string // For local models (e.g., "7B", "13B", "70B")
  requiresApiKey: boolean
  hasApiKey?: boolean // Whether an API key is configured (stored securely)
  apiKey?: string // Encrypted API key (stored securely in models.json)
  isSelected: boolean
  isEnabled: boolean
  isDownloaded?: boolean // For local models
  path?: string // Path to downloaded model file
  description?: string
  status?: ModelStatus // Runtime status for local models
  capabilities?: ModelCapabilities // Model capabilities and best use cases
  downloadUrl?: string // Download URL for local models
  filename?: string // Filename for local models
}

export interface ModelStatusInfo {
  status: ModelStatus
  modelName: string | null
}

export interface ModelsState {
  models: TranscriptionModel[]
  initialized: boolean
  initialize: () => Promise<void>
  initActiveModel: () => Promise<TranscriptionModel | undefined>
  addModel: (model: Omit<TranscriptionModel, 'id'>) => Promise<void>
  updateModel: (
    id: string,
    updates: Partial<TranscriptionModel>
  ) => Promise<void>
  removeModel: (id: string) => Promise<void>
  setApiKey: (id: string, apiKey: string) => Promise<void>
  removeApiKey: (id: string) => Promise<void>
  selectModel: (id: string) => Promise<void>
  toggleEnabled: (id: string) => Promise<void>
  syncDefaultModels: () => Promise<void>
  startLocalModel: (id: string) => Promise<void>
  stopLocalModel: (id: string) => Promise<void>
  refreshModelStatus: (id: string) => Promise<ModelStatus>
}
