import { Cloud, FileText, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { TranscriptionModel } from '../../types'

interface ModelsHeaderProps {
  cloudModelsCount: number
  localModelsCount: number
  selectedModel?: TranscriptionModel
  onSyncModels?: () => void
}

export function ModelsHeader({
  cloudModelsCount,
  localModelsCount,
  selectedModel,
  onSyncModels,
}: ModelsHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-foreground">Models</h1>
        {import.meta.env.DEV && onSyncModels && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSyncModels}
            className="text-xs"
          >
            Sync Default Models
          </Button>
        )}
      </div>

      <div className="flex items-center gap-6 text-sm">
        <StatItem
          icon={Cloud}
          color="text-blue-500"
          label={`${cloudModelsCount} cloud models`}
        />
        <StatItem
          icon={FileText}
          color="text-primary"
          label={`${localModelsCount} local models`}
        />
        {selectedModel && (
          <StatItem
            icon={Check}
            color="text-green-500"
            label={`Using ${selectedModel.name}`}
          />
        )}
      </div>
    </div>
  )
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>
  color: string
  label: string
}

function StatItem({ icon: Icon, color, label }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}
