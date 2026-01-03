import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { getProviderInfo } from '../../provider-info'

import type { TranscriptionModel } from '../../types'

interface ModelActionsMenuProps {
  model: TranscriptionModel
  downloading: string | null
  onSelectModel: (id: string) => void
  onSetApiKey: (model: TranscriptionModel) => void
  onRemoveApiKey: (id: string) => void
  onDownloadModel: (model: TranscriptionModel) => void
  onDeleteModel: (model: TranscriptionModel) => void
  onToggleEnabled: (id: string) => void
  onStartModel?: (id: string) => Promise<void>
  onStopModel?: (id: string) => Promise<void>
}

export function ModelActionsMenu({
  model,
  downloading,
  onSelectModel,
  onSetApiKey,
  onRemoveApiKey,
  onDownloadModel,
  onDeleteModel,
  onToggleEnabled,
  onStartModel,
  onStopModel,
}: ModelActionsMenuProps) {
  const modelName = model.id.replace('whisper-', '')
  const isDownloading = downloading === modelName
  const isLocalModel = model.type === 'local'
  const isRunning = model.status === 'ready'
  const isStopped = model.status === 'stopped' || !model.status

  const hasSelectionActions = !model.isSelected
  const hasConfigActions = model.requiresApiKey
  const hasLifecycleActions = isLocalModel && model.isDownloaded
  const hasDangerActions =
    (isLocalModel && model.isDownloaded) || model.hasApiKey

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* SELECTION SECTION */}
        {hasSelectionActions && (
          <>
            <DropdownMenuItem
              onClick={() => onSelectModel(model.id)}
              className="rounded-sm"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm">Use this model</span>
                <span className="text-xs text-muted-foreground">
                  Set as default transcription model
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* CONFIGURATION SECTION */}
        {hasConfigActions && (
          <>
            {model.hasApiKey ? (
              <DropdownMenuItem
                onClick={() => onSetApiKey(model)}
                className="rounded-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">Update API key</span>
                  <span className="text-xs text-muted-foreground">
                    Change {getProviderInfo(model.provider).name} key
                  </span>
                </div>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onSetApiKey(model)}
                className="rounded-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">Add API key</span>
                  <span className="text-xs text-muted-foreground">
                    Connect to {getProviderInfo(model.provider).name}
                  </span>
                </div>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        {/* DOWNLOAD SECTION (for local models not yet downloaded) */}
        {isLocalModel && !model.isDownloaded && (
          <>
            <DropdownMenuItem
              onClick={() => onDownloadModel(model)}
              disabled={downloading !== null}
              className="rounded-sm"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm">
                  {isDownloading ? 'Downloading...' : 'Download model'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {model.size}
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* LIFECYCLE SECTION (for downloaded local models) */}
        {hasLifecycleActions && (
          <>
            {isStopped && onStartModel && (
              <DropdownMenuItem
                onClick={() => onStartModel(model.id)}
                className="rounded-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">Start model</span>
                  <span className="text-xs text-muted-foreground">
                    Load into memory
                  </span>
                </div>
              </DropdownMenuItem>
            )}
            {isRunning && onStopModel && (
              <DropdownMenuItem
                onClick={() => onStopModel(model.id)}
                className="rounded-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">Stop model</span>
                  <span className="text-xs text-muted-foreground">
                    Unload from memory
                  </span>
                </div>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        {/* GENERAL SECTION */}
        <DropdownMenuItem
          onClick={() => onToggleEnabled(model.id)}
          className="rounded-sm"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">
              {model.isEnabled ? 'Disable model' : 'Enable model'}
            </span>
            <span className="text-xs text-muted-foreground">
              {model.isEnabled
                ? 'Hide from model selection'
                : 'Show in model selection'}
            </span>
          </div>
        </DropdownMenuItem>

        {/* DANGER ZONE */}
        {hasDangerActions && (
          <>
            <DropdownMenuSeparator />
            {isLocalModel && model.isDownloaded && (
              <DropdownMenuItem
                onClick={() => onDeleteModel(model)}
                className="rounded-sm text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">Remove model</span>
                  <span className="text-xs">Free up {model.size}</span>
                </div>
              </DropdownMenuItem>
            )}
            {model.hasApiKey && (
              <DropdownMenuItem
                onClick={() => onRemoveApiKey(model.id)}
                className="rounded-sm text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">Remove API key</span>
                  <span className="text-xs">Disconnect this provider</span>
                </div>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
