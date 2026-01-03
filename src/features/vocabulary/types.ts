import type { VocabularyWord } from './schema'

export type { VocabularyWord }

export interface VocabularyStore {
  words: VocabularyWord[]
  initialized: boolean
  initialize: () => Promise<void>
  addWord: (word: string) => Promise<void>
  updateWord: (id: string, word: string) => Promise<void>
  deleteWord: (id: string) => Promise<void>
}
