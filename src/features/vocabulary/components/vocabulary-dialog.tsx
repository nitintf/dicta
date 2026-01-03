import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useVocabularyStore } from '../store'

interface VocabularyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingWord?: {
    id: string
    word: string
  } | null
}

export function VocabularyDialog({
  open,
  onOpenChange,
  editingWord,
}: VocabularyDialogProps) {
  const { addWord, updateWord } = useVocabularyStore()
  const [word, setWord] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!editingWord

  useEffect(() => {
    if (editingWord) {
      setWord(editingWord.word)
    } else {
      setWord('')
    }
    setError('')
  }, [editingWord, open])

  const handleSave = async () => {
    if (!word.trim()) {
      return
    }

    setLoading(true)
    setError('')
    try {
      if (isEditing) {
        await updateWord(editingWord.id, word.trim())
      } else {
        await addWord(word.trim())
      }
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to save word:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save word. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Word' : 'Add Word to Vocabulary'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the word in your custom vocabulary'
              : 'Add a custom word or term for better speech recognition accuracy'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="word">Word or Term</Label>
            <Input
              id="word"
              placeholder="e.g., Anthropic, GPT-4, React"
              value={word}
              onChange={e => {
                setWord(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter names, technical terms, or specialized vocabulary
            </p>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!word.trim() || loading}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Word'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
