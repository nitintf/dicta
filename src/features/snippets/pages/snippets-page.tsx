import { Sparkles, FileText, Copy, Plus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { InfoCard } from '@/components/ui/info-card'

import { SnippetDialog } from '../components/snippet-dialog'
import { useSnippetsStore } from '../store'

import type { Snippet } from '../types'

export function SnippetsPage() {
  const { snippets, deleteSnippet } = useSnippetsStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<Pick<
    Snippet,
    'id' | 'snippet' | 'expansion'
  > | null>(null)

  const handleCreate = () => {
    setEditingSnippet(null)
    setDialogOpen(true)
  }

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet({
      id: snippet.id,
      snippet: snippet.snippet,
      expansion: snippet.expansion,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) return
    try {
      await deleteSnippet(id)
    } catch (error) {
      console.error('Failed to delete snippet:', error)
    }
  }

  return (
    <div className="h-full w-full flex flex-col px-8">
      <div className="shrink-0 pt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Snippets</h1>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">
                {snippets.length} snippet{snippets.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4 text-blue-500" />
              <span className="text-muted-foreground">0 used today</span>
            </div>
          </div>
        </div>
        <InfoCard variant="accent" className="mb-8">
          <InfoCard.Content className="flex flex-col">
            <div>
              <InfoCard.Title>
                Create{' '}
                <span className="text-primary italic sour-gummy">
                  reusable snippets
                </span>
              </InfoCard.Title>
              <InfoCard.Description>
                Save frequently used phrases, responses, or text templates.
                Quickly insert them into any app with a simple shortcut or
                search.
              </InfoCard.Description>
            </div>
            <div>
              <Button className="h-9 px-4" onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Snippet
              </Button>
            </div>
          </InfoCard.Content>
        </InfoCard>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8">
        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
          Your Snippets
        </h2>
        <div className="space-y-2">
          {snippets.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg bg-transparent">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent mb-3">
                <Sparkles className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                No snippets yet
              </h3>
              <p className="text-xs text-muted-foreground text-center max-w-sm">
                Create your first snippet to save time on repetitive text
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              {snippets.map((snippet, index) => (
                <div
                  key={snippet.id}
                  className={`group p-4 hover:bg-muted/30 transition-colors ${
                    index !== snippets.length - 1
                      ? 'border-b border-border'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground">
                        {snippet.snippet}
                      </h3>
                      <span className="text-xs text-muted-foreground">→</span>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap wrap-break-words">
                        {snippet.expansion}
                      </p>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(snippet)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(snippet.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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

      <SnippetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingSnippet={editingSnippet}
      />
    </div>
  )
}
