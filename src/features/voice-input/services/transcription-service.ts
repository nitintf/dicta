import {
  AppleProvider,
  OpenAIProvider,
  GoogleProvider,
  LocalWhisperProvider,
} from './providers'

import type {
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionProviderInterface,
} from './types'

/**
 * Transcription Service with Router Pattern
 * Supports multiple AI providers (local and cloud)
 */
export class TranscriptionService {
  private providers: Map<string, TranscriptionProviderInterface> = new Map()

  constructor() {
    // Register all providers
    this.registerProvider('apple', new AppleProvider())
    this.registerProvider('openai', new OpenAIProvider())
    this.registerProvider('google', new GoogleProvider())
    this.registerProvider('local-whisper', new LocalWhisperProvider())
  }

  /**
   * Register a custom provider
   */
  registerProvider(
    name: string,
    provider: TranscriptionProviderInterface
  ): void {
    this.providers.set(name, provider)
  }

  /**
   * Get a provider instance
   */
  getProvider(name: string): TranscriptionProviderInterface | undefined {
    return this.providers.get(name)
  }

  /**
   * Transcribe audio using the specified provider
   */
  async transcribe(
    audioBlob: Blob,
    config: TranscriptionConfig
  ): Promise<TranscriptionResult> {
    const provider = this.providers.get(config.provider)

    if (!provider) {
      throw new Error(
        `Provider "${config.provider}" not found. Available providers: ${Array.from(
          this.providers.keys()
        ).join(', ')}`
      )
    }

    // Check if provider is available (if method exists)
    if (provider.isAvailable) {
      const isAvailable = await provider.isAvailable(config)
      if (!isAvailable) {
        throw new Error(
          `Provider "${config.provider}" is not available. Please check your configuration.`
        )
      }
    }

    return provider.transcribe(audioBlob, config)
  }

  /**
   * Check if a provider is available
   */
  async isProviderAvailable(
    provider: string,
    config: TranscriptionConfig
  ): Promise<boolean> {
    const providerInstance = this.providers.get(provider)
    if (!providerInstance) {
      return false
    }

    if (providerInstance.isAvailable) {
      return providerInstance.isAvailable(config)
    }

    return true
  }

  /**
   * List all available providers
   */
  listProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}

// Singleton instance
export const transcriptionService = new TranscriptionService()
