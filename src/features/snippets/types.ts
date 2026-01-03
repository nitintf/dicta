import type { Snippet } from './schema'

export type { Snippet }

export interface SnippetsStore {
  snippets: Snippet[]
  initialized: boolean
  initialize: () => Promise<void>
  createSnippet: (snippet: string, expansion: string) => Promise<void>
  updateSnippet: (
    id: string,
    snippet: string,
    expansion: string
  ) => Promise<void>
  deleteSnippet: (id: string) => Promise<void>
}
