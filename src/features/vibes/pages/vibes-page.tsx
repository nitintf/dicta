import { FileText, Wand2 } from 'lucide-react'

import { VibesPanel } from '../components'
import { useVibesStore } from '../store'

export function VibesPage() {
  const { vibes } = useVibesStore()

  const customVibesCount = vibes.filter(s => !s.isDefault).length
  const totalVibesCount = vibes.length

  return (
    <div className="h-full p-8 pt-16 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Vibes</h1>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {totalVibesCount} vibe{totalVibesCount !== 1 ? 's' : ''} (
              {customVibesCount} custom)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-500" />
            <span className="text-muted-foreground">0 applied today</span>
          </div>
        </div>
      </div>

      <div className="pb-16">
        <VibesPanel />
      </div>
    </div>
  )
}
