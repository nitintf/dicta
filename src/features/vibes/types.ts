import type { Vibe, VibeCategory } from './schema'

export type { Vibe, VibeCategory }

export interface VibesStore {
  vibes: Vibe[]
  selectedVibes: Record<VibeCategory, string | null> // Selected vibe per category
  initialized: boolean
  initialize: () => Promise<void>
  createVibe: (
    name: string,
    description: string,
    prompt: string,
    category: VibeCategory,
    example?: string
  ) => Promise<void>
  updateVibe: (
    id: string,
    name: string,
    description: string,
    prompt: string,
    example?: string
  ) => Promise<void>
  deleteVibe: (id: string) => Promise<void>
  selectVibeForCategory: (
    category: VibeCategory,
    vibeId: string | null
  ) => Promise<void>
}

export const defaultVibes: Vibe[] = [
  // Personal message vibes - 3 vibes
  {
    id: 'personal-polished',
    name: 'Polished',
    description: 'Proper caps + full punctuation',
    prompt:
      'Reformat as a polished personal message with proper capitalization and complete punctuation.',
    example:
      "Hey, are you free for lunch tomorrow? Let's do 12 if that works for you.",
    category: 'personal',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'personal-relaxed',
    name: 'Relaxed',
    description: 'Proper caps + minimal punctuation',
    prompt:
      'Reformat as a relaxed personal message with proper capitalization but minimal punctuation.',
    example:
      "Hey are you free for lunch tomorrow? Let's do 12 if that works for you",
    category: 'personal',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'personal-chill',
    name: 'Chill',
    description: 'Lowercase + minimal punctuation',
    prompt:
      'Reformat as a very casual personal message with lowercase letters and minimal punctuation.',
    example:
      "hey are you free for lunch tomorrow let's do 12 if that works for you",
    category: 'personal',
    isDefault: true,
    createdAt: Date.now(),
  },

  // Work message vibes - 3 vibes
  {
    id: 'work-executive',
    name: 'Executive',
    description: 'Clear, concise, professional',
    prompt:
      'Reformat as an executive-level work message with clear, concise, and professional business language.',
    example:
      'Are you available for lunch tomorrow? 12:00 works well on my end.',
    category: 'work',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'work-collaborative',
    name: 'Collaborative',
    description: 'Professional yet approachable',
    prompt:
      'Reformat as a collaborative work message with professional yet approachable and team-oriented language.',
    example: 'Hey team! Are you free for lunch tomorrow? How does 12:00 sound?',
    category: 'work',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'work-casual',
    name: 'Casual',
    description: 'Friendly team communication',
    prompt:
      'Reformat as a casual work message with friendly, conversational tone suitable for team chat.',
    example: "hey, lunch tomorrow? 12 works for me if you're free",
    category: 'work',
    isDefault: true,
    createdAt: Date.now(),
  },

  // Email vibes - 3 vibes
  {
    id: 'email-professional',
    name: 'Professional',
    description: 'Proper caps + full punctuation',
    prompt:
      'Reformat as a professional email with proper capitalization, complete punctuation, formal greeting, and professional closing.',
    example:
      "Hi there,\n\nAre you available for lunch tomorrow? I'm thinking 12:00 if that works for you.\n\nBest regards",
    category: 'email',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'email-friendly',
    name: 'Friendly',
    description: 'Proper caps + warm tone',
    prompt:
      'Reformat as a friendly email with proper capitalization, warm tone, and casual but professional language.',
    example:
      "Hey!\n\nAre you free for lunch tomorrow? Let's do 12:00 if that works for you.\n\nCheers",
    category: 'email',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'email-enthusiastic',
    name: 'Enthusiastic',
    description: 'Energetic with exclamations',
    prompt:
      'Reformat as an enthusiastic email with exclamation points, energetic language, and upbeat tone.',
    example:
      "Hey!\n\nAre you free for lunch tomorrow? Let's do 12:00 - it'll be great to catch up!\n\nLooking forward to it!",
    category: 'email',
    isDefault: true,
    createdAt: Date.now(),
  },

  // Other/custom - 1 default vibe (users can add unlimited custom vibes)
  {
    id: 'other-raw',
    name: 'Raw Transcription',
    description: 'No formatting applied',
    prompt: '',
    category: 'other',
    example:
      "Hey, Are you free for lunch tomorrow? Let's do 12 if that works for you.",
    isDefault: true,
    createdAt: Date.now(),
  },
]
