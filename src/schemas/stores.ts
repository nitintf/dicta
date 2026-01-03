import { z } from 'zod'

// Settings Schema
export const settingsSchema = z.object({
  onboarding: z.object({
    completed: z.boolean(),
  }),
  voiceInput: z.object({
    shortcut: z.string(),
    microphoneDeviceId: z.string().nullable(),
  }),
  transcription: z.object({
    language: z.string(),
    autoPaste: z.boolean(),
    autoCopyToClipboard: z.boolean(),
  }),
  shortcuts: z.object({
    pasteLastTranscript: z.string(),
    globalShortcutsEnabled: z.boolean(),
  }),
  system: z.object({
    showInDock: z.boolean(),
    saveAudioRecordings: z.boolean(),
  }),
  privacy: z.object({
    analytics: z.boolean(),
    errorLogging: z.boolean(),
  }),
})

// Transcription Record Schema
const transcriptionRecordSchema = z.object({
  id: z.string(),
  text: z.string(),
  timestamp: z.number(),
  duration: z.number().optional().nullable(),
  wordCount: z.number(),
  modelId: z.string(),
  provider: z.string(),
})

// Transcriptions Store Schema
export const transcriptionsSchema = z.object({
  transcriptions: z.array(transcriptionRecordSchema),
})

// Snippet Schema
const snippetSchema = z.object({
  id: z.string(),
  snippet: z.string(),
  expansion: z.string(),
  createdAt: z.number(),
})

// Snippets Store Schema
export const snippetsSchema = z.object({
  snippets: z.array(snippetSchema),
})

// Vocabulary Word Schema
const vocabularyWordSchema = z.object({
  id: z.string(),
  word: z.string(),
  createdAt: z.number(),
})

// Vocabulary Store Schema
export const vocabularySchema = z.object({
  words: z.array(vocabularyWordSchema),
})

// Vibe Schema
const vibeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  category: z.enum(['personal', 'work', 'email', 'others']),
  createdAt: z.number(),
  isCustom: z.boolean(),
})

// Vibes Store Schema
export const vibesSchema = z.object({
  vibes: z.array(vibeSchema),
})

// Map of file names to their schemas
export const storeSchemas: Record<string, z.ZodSchema> = {
  'settings.json': settingsSchema,
  'transcriptions.json': transcriptionsSchema,
  'snippets.json': snippetsSchema,
  'vocabulary.json': vocabularySchema,
  'vibes.json': vibesSchema,
}

// Validate store data
export function validateStoreData(
  fileName: string,
  data: unknown
): { success: true; data: unknown } | { success: false; error: string } {
  const schema = storeSchemas[fileName]

  if (!schema) {
    return {
      success: false,
      error: `Unknown store file: ${fileName}`,
    }
  }

  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      return {
        success: false,
        error: `Invalid data format in ${fileName}: ${errorMessages.join(', ')}`,
      }
    }
    return {
      success: false,
      error: `Validation failed for ${fileName}`,
    }
  }
}
