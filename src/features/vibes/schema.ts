import { z } from 'zod'

export const vibeCategorySchema = z.enum(['personal', 'work', 'email', 'other'])

export const vibeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
  category: vibeCategorySchema,
  example: z.string().optional(),
  createdAt: z.number(),
  isDefault: z.boolean(),
})

export const vibesStoreSchema = z.object({
  vibes: z.array(vibeSchema),
  selectedVibes: z.record(vibeCategorySchema, z.string().nullable()),
})

export type VibeCategory = z.infer<typeof vibeCategorySchema>
export type Vibe = z.infer<typeof vibeSchema>
