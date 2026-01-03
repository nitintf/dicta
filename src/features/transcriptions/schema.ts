import { z } from 'zod'

export const transcriptionRecordSchema = z.object({
  id: z.string(),
  text: z.string(),
  timestamp: z.number(),
  duration: z.number().optional().nullable(),
  wordCount: z.number(),
  modelId: z.string(),
  provider: z.string(),
})

export const transcriptionsStoreSchema = z.object({
  transcriptions: z.array(transcriptionRecordSchema),
})

export type Transcription = z.infer<typeof transcriptionRecordSchema>
export type Transcriptions = z.infer<typeof transcriptionsStoreSchema>
