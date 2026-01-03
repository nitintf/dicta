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
import { Textarea } from '@/components/ui/textarea'

import { useSnippetsStore } from '../store'

interface SnippetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingSnippet?: {
    id: string
    snippet: string
    expansion: string
  } | null
}

export function SnippetDialog({
  open,
  onOpenChange,
  editingSnippet,
}: SnippetDialogProps) {
  const { createSnippet, updateSnippet } = useSnippetsStore()
  const [snippet, setSnippet] = useState('')
  const [expansion, setExpansion] = useState('')
  const [loading, setLoading] = useState(false)

  const isEditing = !!editingSnippet

  useEffect(() => {
    if (editingSnippet) {
      setSnippet(editingSnippet.snippet)
      setExpansion(editingSnippet.expansion)
    } else {
      setSnippet('')
      setExpansion('')
    }
  }, [editingSnippet, open])

  const handleSave = async () => {
    if (!snippet.trim() || !expansion.trim()) {
      return
    }

    setLoading(true)
    try {
      if (isEditing) {
        await updateSnippet(editingSnippet.id, snippet.trim(), expansion.trim())
      } else {
        await createSnippet(snippet.trim(), expansion.trim())
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save snippet:', error)
      alert('Failed to save snippet. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Snippet' : 'Create New Snippet'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modify your snippet shorthand and expansion'
              : 'Create a reusable snippet with a shorthand trigger and full expansion'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="snippet">Snippet</Label>
            <Input
              id="snippet"
              placeholder="e.g., my email address"
              value={snippet}
              onChange={e => setSnippet(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              The shorthand text you'll type to trigger this snippet
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expansion">Expansion</Label>
            <Textarea
              id="expansion"
              placeholder="e.g., john.doe@example.com"
              value={expansion}
              onChange={e => setExpansion(e.target.value)}
              className="min-h-[200px] resize-none"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              The full text that will replace your snippet
            </p>
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
          <Button
            onClick={handleSave}
            disabled={!snippet.trim() || !expansion.trim() || loading}
          >
            {loading
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Create Snippet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
