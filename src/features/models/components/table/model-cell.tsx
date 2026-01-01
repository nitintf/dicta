import { Check, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { getModelCapabilities } from '../../model-capabilities'
import { getProviderInfo } from '../../provider-info'
import { ModelInfoTooltip } from '../model-info-tooltip'

import type { TranscriptionModel, ModelStatus } from '../../types'

interface ModelCellProps {
  model: TranscriptionModel
  onRefreshStatus?: (modelId: string) => Promise<void>
  showSelectedIndicator?: boolean
}

export function ModelCell({
  model,
  onRefreshStatus,
  showSelectedIndicator,
}: ModelCellProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const providerInfo = getProviderInfo(model.provider)
  const isLocalModel = model.type === 'local'
  const status: ModelStatus = model.status || 'stopped'
  const capabilities = getModelCapabilities(model.id)

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRefreshing(true)
    try {
      if (onRefreshStatus) {
        await onRefreshStatus(model.id)
      }
      toast.success('Model status refreshed')
    } catch (error) {
      toast.error('Failed to refresh model status', {
        description: `If the problem persists, try stopping and restarting the model.`,
        duration: 5000,
      })
      console.error('Error refreshing model status', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Determine what to show in the indicator column
  const renderIndicator = () => {
    if (!showSelectedIndicator) return null

    // For selected model, show checkmark
    if (model.isSelected) {
      return (
        <div className="flex items-center justify-center w-5">
          <Check className="h-4 w-4 text-primary" strokeWidth={3} />
        </div>
      )
    }

    // For local downloaded models, show status dot
    if (isLocalModel && model.isDownloaded) {
      const dotColor =
        status === 'ready'
          ? 'bg-green-500'
          : status === 'loading'
            ? 'bg-blue-500 animate-pulse'
            : status === 'error'
              ? 'bg-red-500'
              : 'bg-gray-400'

      const tooltipText =
        status === 'ready'
          ? 'Model is running and ready to use'
          : status === 'stopped'
            ? 'Model is stopped - click Start in menu to load'
            : status === 'loading'
              ? 'Model is loading into memory...'
              : 'Model failed to start - check menu for actions'

      return (
        <div className="flex items-center justify-center w-5">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`w-2 h-2 rounded-full ${dotColor} cursor-help`}
                />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }

    // Empty space for other models
    return <div className="w-5" />
  }

  return (
    <div className="flex items-center gap-3">
      {renderIndicator()}
      <div className={providerInfo.color}>{providerInfo.icon}</div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{model.name}</span>
          {isLocalModel && model.isDownloaded && onRefreshStatus && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 cursor-pointer"
              onClick={handleRefresh}
              title="Refresh status"
              disabled={isRefreshing}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          <ModelInfoTooltip capabilities={capabilities} />
        </div>
        <span className="text-xs text-muted-foreground">
          {providerInfo.name}
          {model.size && ` • ${model.size}`}
        </span>
      </div>
    </div>
  )
}
