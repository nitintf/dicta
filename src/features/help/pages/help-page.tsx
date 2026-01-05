import { HelpCircle, Book, MessageCircle, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { InfoCard } from '@/components/ui/info-card'

export function HelpPage() {
  return (
    <div className="h-full p-8 pt-16 pb-16 max-w-6xl overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Help & Support
        </h1>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Book className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Documentation</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span className="text-muted-foreground">Community Support</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <InfoCard variant="accent" className="mb-8">
        <InfoCard.Content>
          <div>
            <InfoCard.Title>
              Get{' '}
              <span className="text-primary italic sour-gummy">
                help when you need it
              </span>
            </InfoCard.Title>
            <InfoCard.Description>
              Access comprehensive guides, tutorials, and support resources. Our
              community and support team are here to help you get the most out
              of Dicta.
            </InfoCard.Description>
          </div>
          <div>
            <Button className="h-9 px-4">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Help Center
            </Button>
          </div>
        </InfoCard.Content>
      </InfoCard>

      {/* Content */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
          Resources
        </h2>
        <div className="space-y-2">
          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg bg-gray-50/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-3">
              <HelpCircle className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              Help resources coming soon
            </h3>
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              We're building a comprehensive help center for you
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
