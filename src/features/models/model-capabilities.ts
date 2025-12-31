import type { ModelCapabilities, ModelProvider } from './types'

export const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  // OpenAI Whisper
  'whisper-1': {
    accuracy: 'high',
    speed: 'fast',
    languages: 99,
    features: ['Multilingual', 'Timestamps', 'Word-level confidence'],
    bestFor: [
      'General purpose transcription',
      'Multiple languages',
      'High accuracy needed',
    ],
  },

  // Google Cloud Speech
  'google-cloud-speech': {
    accuracy: 'high',
    speed: 'fast',
    languages: 125,
    features: [
      'Speaker diarization',
      'Automatic punctuation',
      'Word-level timestamps',
    ],
    bestFor: [
      'Enterprise applications',
      'Multi-speaker conversations',
      'Professional meetings',
    ],
  },

  // AssemblyAI
  'assemblyai-best': {
    accuracy: 'high',
    speed: 'medium',
    languages: 30,
    features: [
      'Speaker detection',
      'Sentiment analysis',
      'Auto highlights',
      'Content moderation',
    ],
    bestFor: [
      'Podcast transcription',
      'Interview analysis',
      'Content creation',
    ],
  },

  // ElevenLabs Scribe
  'elevenlabs-scribe': {
    accuracy: 'high',
    speed: 'fast',
    languages: 30,
    features: [
      'Multilingual support',
      'High accuracy',
      'Fast processing',
      'Speaker identification',
    ],
    bestFor: ['Voice notes', 'Quick transcriptions', 'Multiple languages'],
  },

  // Apple Speech Recognition
  'apple-speech': {
    accuracy: 'medium',
    speed: 'fast',
    languages: 50,
    features: [
      'On-device processing',
      'Privacy focused',
      'No internet required',
    ],
    bestFor: ['Privacy-sensitive content', 'Offline usage', 'Quick notes'],
  },

  // Local Whisper Models
  'whisper-tiny': {
    accuracy: 'low',
    speed: 'fast',
    languages: 99,
    features: ['Offline', 'Privacy focused', 'Fast processing'],
    bestFor: ['Quick drafts', 'Real-time captioning', 'Low-resource devices'],
  },

  'whisper-base': {
    accuracy: 'medium',
    speed: 'fast',
    languages: 99,
    features: ['Offline', 'Privacy focused', 'Good balance'],
    bestFor: [
      'General offline use',
      'Privacy-sensitive content',
      'Balanced accuracy/speed',
    ],
  },

  'whisper-small': {
    accuracy: 'high',
    speed: 'medium',
    languages: 99,
    features: ['Offline', 'Privacy focused', 'High accuracy'],
    bestFor: [
      'Professional transcription',
      'Important documents',
      'Offline workflows',
    ],
  },

  'whisper-medium': {
    accuracy: 'high',
    speed: 'slow',
    languages: 99,
    features: ['Offline', 'Privacy focused', 'Highest accuracy'],
    bestFor: [
      'Critical transcriptions',
      'Legal/medical documents',
      'Maximum accuracy needed',
    ],
  },
}

export function getModelCapabilities(
  modelId: string
): ModelCapabilities | undefined {
  return MODEL_CAPABILITIES[modelId]
}

export function getProviderCapabilitySummary(provider: ModelProvider): string {
  switch (provider) {
    case 'openai':
      return 'Fast, accurate, supports 99 languages'
    case 'google':
      return 'Enterprise-grade with speaker detection'
    case 'assemblyai':
      return 'Advanced features including sentiment analysis'
    case 'elevenlabs':
      return 'High-quality multilingual transcription'
    case 'apple':
      return 'On-device, privacy-focused, works offline'
    case 'local-whisper':
      return 'Fully offline, privacy-first, no API costs'
    default:
      return 'Speech-to-text transcription'
  }
}
