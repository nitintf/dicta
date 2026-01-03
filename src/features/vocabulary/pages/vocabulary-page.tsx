import { BookOpen, Plus, Pencil, Trash2, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { InfoCard } from '@/components/ui/info-card'

import { VocabularyDialog } from '../components/vocabulary-dialog'
import { useVocabularyStore } from '../store'

import type { VocabularyWord } from '../types'

export function VocabularyPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<Pick<
    VocabularyWord,
    'id' | 'word'
  > | null>(null)

  const { words, deleteWord } = useVocabularyStore()

  const handleCreate = () => {
    setEditingWord(null)
    setDialogOpen(true)
  }

  const handleEdit = (word: VocabularyWord) => {
    setEditingWord({
      id: word.id,
      word: word.word,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this word?')) return
    try {
      await deleteWord(id)
    } catch (error) {
      console.error('Failed to delete word:', error)
    }
  }

  return (
    <>
      <div className="h-full p-8 pt-16 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Vocabulary
          </h1>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">
                {words.length} word{words.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <InfoCard variant="accent" className="mb-8">
          <InfoCard.Content className="flex flex-col">
            <div>
              <InfoCard.Title>
                Build your{' '}
                <span className="text-primary italic">custom vocabulary</span>
              </InfoCard.Title>
              <InfoCard.Description>
                Add names, technical terms, or specialized words to improve
                speech recognition accuracy. These words will be prioritized
                during transcription.
              </InfoCard.Description>
            </div>
            <div>
              <Button className="h-9 px-4" onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Word
              </Button>
            </div>
          </InfoCard.Content>
        </InfoCard>

        {/* Content */}
        <div className="max-w-4xl">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            Your Words
          </h2>
          <div className="space-y-2">
            {words.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 rounded-full mb-3">
                  <Sparkles className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  No words yet
                </h3>
                <p className="text-xs text-muted-foreground text-center max-w-sm">
                  Start building your custom vocabulary for better transcription
                  accuracy
                </p>
              </div>
            ) : (
              /* Words list */
              <div className="rounded-xl border border-border bg-background overflow-hidden">
                {words.map((word, index) => (
                  <div
                    key={word.id}
                    className={`group p-4 hover:bg-muted/30 transition-colors ${
                      index !== words.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {word.word}
                        </p>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(word)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(word.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <VocabularyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingWord={editingWord}
      />
    </>
  )
}
