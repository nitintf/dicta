import { Info } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import type { ModelCapabilities } from '../types'

interface ModelInfoTooltipProps {
  capabilities?: ModelCapabilities
}

export function ModelInfoTooltip({ capabilities }: ModelInfoTooltipProps) {
  if (!capabilities) return null

  const getAccuracyColor = (accuracy: string) => {
    switch (accuracy) {
      case 'high':
        return 'text-green-600 dark:text-green-500'
      case 'medium':
        return 'text-orange-600 dark:text-orange-500'
      case 'low':
        return 'text-red-600 dark:text-red-500'
      default:
        return ''
    }
  }

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast':
        return 'text-green-600 dark:text-green-500'
      case 'medium':
        return 'text-orange-600 dark:text-orange-500'
      case 'slow':
        return 'text-red-600 dark:text-red-500'
      default:
        return ''
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-accent/50 transition-colors group"
          onClick={e => e.stopPropagation()}
        >
          <Info className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="w-72 p-4 bg-muted/95 border border-border shadow-lg"
        sideOffset={8}
        showArrow={false}
      >
        <div className="space-y-3">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 text-xs pb-3 border-b border-border">
            <div>
              <div className="text-muted-foreground mb-1">Accuracy</div>
              <div
                className={`font-semibold capitalize ${getAccuracyColor(capabilities.accuracy)}`}
              >
                {capabilities.accuracy}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Speed</div>
              <div
                className={`font-semibold capitalize ${getSpeedColor(capabilities.speed)}`}
              >
                {capabilities.speed}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Languages</div>
              <div className="font-semibold text-foreground">
                {capabilities.languages}+
              </div>
            </div>
          </div>

          {/* Features */}
          {capabilities.features.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-foreground mb-2">
                Features
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {capabilities.features.map(feature => (
                  <div key={feature}>• {feature}</div>
                ))}
              </div>
            </div>
          )}

          {/* Best For */}
          {capabilities.bestFor.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-foreground mb-2">
                Best For
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {capabilities.bestFor.map(useCase => (
                  <div key={useCase}>• {useCase}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
