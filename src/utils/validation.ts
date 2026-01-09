import { z } from 'zod'

import {
  settingsSchema,
  snippetsSchema as snippetsStoreSchema,
  transcriptionsSchema as transcriptionsStoreSchema,
  vibesSchema as vibesStoreSchema,
  vocabularySchema as vocabularyStoreSchema,
} from '@/schemas/stores'

// Map of file names to their schemas
export const storeSchemas: Record<string, z.ZodSchema> = {
  'settings.json': settingsSchema,
  'transcriptions.json': transcriptionsStoreSchema,
  'snippets.json': snippetsStoreSchema,
  'vocabulary.json': vocabularyStoreSchema,
  'vibes.json': vibesStoreSchema,
}

// Validation result type
export type ValidationResult =
  | { success: true; data: unknown }
  | { success: false; error: string }

/**
 * Validate store data against its schema
 * @param fileName - Name of the store file (e.g., 'settings.json')
 * @param data - Data to validate
 * @returns Validation result with data or error
 */
export function validateStoreData(
  fileName: string,
  data: unknown
): ValidationResult {
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
