import { Sparkles, FileText, Copy, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { InfoCard } from '@/components/ui/info-card'

export function SnippetsPage() {
  return (
    <div className="h-full p-8 pt-16 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Snippets</h1>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">0 snippets</span>
          </div>
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-blue-500" />
            <span className="text-muted-foreground">0 used today</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <InfoCard variant="accent" className="mb-8">
        <InfoCard.Content>
          <div>
            <InfoCard.Title>
              Create{' '}
              <span className="text-primary italic">reusable snippets</span>
            </InfoCard.Title>
            <InfoCard.Description>
              Save frequently used phrases, responses, or text templates.
              Quickly insert them into any app with a simple shortcut or search.
            </InfoCard.Description>
          </div>
          <div>
            <Button className="h-9 px-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Snippet
            </Button>
          </div>
        </InfoCard.Content>
      </InfoCard>

      {/* Content */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
          Your Snippets
        </h2>
        <div className="space-y-2">
          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg bg-gray-50/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-3">
              <Sparkles className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              No snippets yet
            </h3>
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              Create your first snippet to save time on repetitive text
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
