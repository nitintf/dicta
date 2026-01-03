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

import { useVibesStore } from '../store'

import type { VibeCategory } from '../types'

interface VibeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingVibe?: {
    id: string
    name: string
    description: string
    prompt: string
    example?: string
  } | null
  category?: VibeCategory | null
}

const CATEGORY_LABELS: Record<VibeCategory, string> = {
  personal: 'Personal messages',
  work: 'Work messages',
  email: 'Email',
  other: 'Other',
}

export function VibeDialog({
  open,
  onOpenChange,
  editingVibe,
  category,
}: VibeDialogProps) {
  const { createVibe, updateVibe } = useVibesStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [example, setExample] = useState('')
  const [loading, setLoading] = useState(false)

  const isEditing = !!editingVibe

  useEffect(() => {
    if (editingVibe) {
      setName(editingVibe.name)
      setDescription(editingVibe.description)
      setPrompt(editingVibe.prompt)
      setExample(editingVibe.example || '')
    } else {
      setName('')
      setDescription('')
      setPrompt('')
      setExample('')
    }
  }, [editingVibe, open])

  const handleSave = async () => {
    // For "other" category, example is optional
    const isOtherCategory = category === 'other'
    const exampleRequired = !isOtherCategory

    if (
      !name.trim() ||
      !description.trim() ||
      !prompt.trim() ||
      (exampleRequired && !example.trim())
    ) {
      return
    }

    setLoading(true)
    try {
      if (isEditing) {
        await updateVibe(
          editingVibe.id,
          name.trim(),
          description.trim(),
          prompt.trim(),
          example.trim() || undefined
        )
      } else if (category) {
        await createVibe(
          name.trim(),
          description.trim(),
          prompt.trim(),
          category,
          example.trim() || undefined
        )
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save vibe:', error)
      alert('Failed to save vibe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = () => {
    if (category) {
      return CATEGORY_LABELS[category]
    }
    return ''
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? 'Edit Vibe'
              : `Create New Vibe for ${getCategoryLabel()}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modify your custom transcription vibe'
              : 'Create a custom transcription vibe with your own formatting instructions'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vibe Name</Label>
            <Input
              id="name"
              placeholder="e.g., Meeting Notes"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Input
              id="description"
              placeholder="e.g., Caps + Punctuation"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              A brief description of what this vibe does
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Formatting Instructions</Label>
            <Textarea
              id="prompt"
              placeholder="Describe how the transcription should be formatted..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Example: "Format the transcription as bullet points with clear
              sections. Remove filler words and focus on key information."
            </p>
          </div>

          {category !== 'other' && (
            <div className="space-y-2">
              <Label htmlFor="example">Example Output</Label>
              <Textarea
                id="example"
                placeholder="Show how this vibe formats text..."
                value={example}
                onChange={e => setExample(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Example: "Hey! Are you free for lunch tomorrow? Let's do 12 if
                that works!"
              </p>
            </div>
          )}
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
            disabled={
              !name.trim() ||
              !description.trim() ||
              !prompt.trim() ||
              (category !== 'other' && !example.trim()) ||
              loading
            }
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Vibe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
