import { z } from 'zod'

export const snippetSchema = z.object({
  id: z.string(),
  snippet: z.string(),
  expansion: z.string(),
  createdAt: z.number(),
})

export const snippetsStoreSchema = z.object({
  snippets: z.array(snippetSchema),
})

export type Snippet = z.infer<typeof snippetSchema>
export type SnippetsStore = z.infer<typeof snippetsStoreSchema>
