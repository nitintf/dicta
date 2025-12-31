import { Palette, FileText, Wand2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { InfoCard } from '@/components/ui/info-card'

export function StylesPage() {
  return (
    <div className="h-full p-8 pt-16 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Styles</h1>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">0 styles</span>
          </div>
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-500" />
            <span className="text-muted-foreground">0 applied today</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <InfoCard variant="accent" className="mb-8">
        <InfoCard.Content>
          <div>
            <InfoCard.Title>
              Apply <span className="text-primary italic">custom styles</span>
            </InfoCard.Title>
            <InfoCard.Description>
              Transform your transcriptions with AI-powered styling. Make text
              formal, casual, professional, or apply any custom tone you need.
            </InfoCard.Description>
          </div>
          <div>
            <Button className="h-9 px-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Style
            </Button>
          </div>
        </InfoCard.Content>
      </InfoCard>

      {/* Content */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
          Your Styles
        </h2>
        <div className="space-y-2">
          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg bg-gray-50/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-3">
              <Palette className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              No styles yet
            </h3>
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              Create your first style to transform transcriptions automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
