import { z } from 'zod'

export const vocabularyWordSchema = z.object({
  id: z.string(),
  word: z.string(),
  createdAt: z.number(),
})

export const vocabularyStoreSchema = z.object({
  words: z.array(vocabularyWordSchema),
})

export type VocabularyWord = z.infer<typeof vocabularyWordSchema>
export type VocabularyStore = z.infer<typeof vocabularyStoreSchema>
