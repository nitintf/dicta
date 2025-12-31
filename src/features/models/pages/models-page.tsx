import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import {
  MoreHorizontal,
  Check,
  FileText,
  Cloud,
  Search,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InfoCard } from '@/components/ui/info-card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useModelsStore, initializeModels, type TranscriptionModel } from '..'
import { ApiKeyModal } from '../components/api-key-modal'
import { ModelInfoTooltip } from '../components/model-info-tooltip'
import { ModelStatusBadge } from '../components/model-status-badge'
import { getModelCapabilities } from '../model-capabilities'
import { getProviderInfo } from '../provider-info'

export function ModelsPage() {
  const {
    models,
    initialized,
    selectModel,
    toggleEnabled,
    setApiKey,
    removeApiKey,
    removeModel,
    syncDefaultModels,
  } = useModelsStore()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [apiKeyModalModel, setApiKeyModalModel] =
    useState<TranscriptionModel | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    if (!initialized) {
      void initializeModels()
    }
  }, [initialized])

  // Listen for download progress
  useEffect(() => {
    const unlisten = listen<{
      downloaded: number
      total: number
      percentage: number
      model: string
    }>('whisper-download-progress', event => {
      // Progress is shown in the toast, so we don't need to do anything here
      console.log('Download progress:', event.payload)
    })

    return () => {
      void unlisten.then(fn => fn())
    }
  }, [])

  const handleDownloadModel = async (modelName: string) => {
    setDownloading(modelName)

    const downloadPromise = invoke<string>('download_whisper_model', {
      modelName,
    })

    toast.promise(downloadPromise, {
      loading: `Downloading ${modelName} model...`,
      success: async () => {
        setDownloading(null)
        // Reload models to update state
        await initializeModels()

        // Auto-select and start the downloaded model
        const modelId = `whisper-${modelName}`
        await selectModel(modelId)

        return `${modelName} model ready to use!`
      },
      error: error => {
        setDownloading(null)
        return `Failed to download ${modelName}: ${error}`
      },
    })
  }

  const handleDeleteModel = async (modelId: string, modelName: string) => {
    try {
      await invoke('delete_whisper_model', { modelName })
      toast.success(`${modelName} model deleted`)
      await removeModel(modelId)
      void initializeModels()
    } catch (error) {
      toast.error(`Failed to delete ${modelName}: ${error}`)
    }
  }

  const columns: ColumnDef<TranscriptionModel>[] = [
    {
      accessorKey: 'isSelected',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.isSelected && (
            <div className="w-2 h-2 rounded-full bg-primary" />
          )}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Model',
      cell: ({ row }) => {
        console.log(row.original)
        const providerInfo = getProviderInfo(row.original.provider)
        const isLocalWhisper = row.original.provider === 'local-whisper'
        const status = row.original.status
        const capabilities = getModelCapabilities(row.original.id)

        return (
          <div className="flex items-center gap-3">
            <div className={providerInfo.color}>{providerInfo.icon}</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{row.original.name}</span>
                {isLocalWhisper && status && (
                  <ModelStatusBadge status={status} />
                )}
                <ModelInfoTooltip capabilities={capabilities} />
              </div>
              <span className="text-xs text-muted-foreground">
                {providerInfo.name}
                {row.original.size && ` • ${row.original.size}`}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const typeConfig = {
          cloud: {
            label: 'Cloud',
            className: 'bg-blue-50 text-blue-700 border-blue-200',
          },
          local: {
            label: 'Local',
            className: 'bg-purple-50 text-purple-700 border-purple-200',
          },
          apple: {
            label: 'Apple',
            className: 'bg-gray-50 text-gray-700 border-gray-200',
          },
        }
        const config = typeConfig[row.original.type]
        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: 'connectivity',
      header: 'Connectivity',
      cell: ({ row }) => {
        const requiresConnection = row.original.type === 'cloud'
        return (
          <div className="flex items-center gap-2">
            {requiresConnection ? (
              <>
                <Wifi className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Offline</span>
              </>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'apiKey',
      header: 'Status',
      cell: ({ row }) => {
        if (row.original.type === 'local') {
          return row.original.isDownloaded ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Downloaded
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-700 border-gray-200"
            >
              Not Downloaded
            </Badge>
          )
        }

        if (row.original.requiresApiKey) {
          return row.original.apiKey ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Configured
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200"
            >
              Needs API Key
            </Badge>
          )
        }

        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Ready
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const model = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              {/* Model Selection */}
              {!model.isSelected && (
                <DropdownMenuItem
                  onClick={() => void selectModel(model.id)}
                  className="rounded-md"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">Use this model</span>
                    <span className="text-xs text-muted-foreground">
                      Set as default transcription model
                    </span>
                  </div>
                </DropdownMenuItem>
              )}

              {/* API Key Management */}
              {model.requiresApiKey && (
                <>
                  {model.apiKey ? (
                    <DropdownMenuItem
                      onClick={() => void removeApiKey(model.id)}
                      className="rounded-md text-destructive focus:text-destructive"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">Remove API key</span>
                        <span className="text-xs">
                          Disconnect this provider
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => setApiKeyModalModel(model)}
                      className="rounded-md"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">Add API key</span>
                        <span className="text-xs text-muted-foreground">
                          Connect to {getProviderInfo(model.provider).name}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {/* Local Model Actions */}
              {model.type === 'local' && (
                <>
                  {!model.isDownloaded ? (
                    <DropdownMenuItem
                      onClick={() => {
                        const modelName = model.id.replace('whisper-', '')
                        void handleDownloadModel(modelName)
                      }}
                      disabled={downloading !== null}
                      className="rounded-md"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {downloading === model.id.replace('whisper-', '')
                            ? 'Downloading...'
                            : 'Download model'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {model.size}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() =>
                        void handleDeleteModel(
                          model.id,
                          model.id.replace('whisper-', '')
                        )
                      }
                      className="rounded-md text-destructive focus:text-destructive"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">Remove model</span>
                        <span className="text-xs">Free up {model.size}</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {/* Enable/Disable Toggle */}
              <DropdownMenuItem
                onClick={() => void toggleEnabled(model.id)}
                className="rounded-md mt-1"
              >
                <div className="flex flex-col w-full">
                  <span className="font-medium">
                    {model.isEnabled ? 'Disable model' : 'Enable model'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {model.isEnabled
                      ? 'Hide from model selection'
                      : 'Show in model selection'}
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: models,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading models...</p>
      </div>
    )
  }

  const cloudModelsCount = models.filter(m => m.type === 'cloud').length
  const localModelsCount = models.filter(m => m.type === 'local').length
  const selectedModel = models.find(m => m.isSelected)

  return (
    <div className="h-full p-8 pt-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">Models</h1>
          {import.meta.env.DEV && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void syncDefaultModels()}
              className="text-xs"
            >
              Sync Default Models
            </Button>
          )}
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-500" />
            <span className="text-muted-foreground">
              {cloudModelsCount} cloud models
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {localModelsCount} local models
            </span>
          </div>
          {selectedModel && (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">
                Using {selectedModel.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <InfoCard variant="accent" className="mb-8">
        <InfoCard.Content>
          <div>
            <InfoCard.Title>
              Manage{' '}
              <span className="text-primary italic">transcription models</span>
            </InfoCard.Title>
            <InfoCard.Description>
              Choose from cloud AI providers, run models locally, or use Apple's
              built-in speech recognition. Configure API keys, manage downloads,
              and select your preferred transcription engine to get the best
              accuracy and performance for your needs.
            </InfoCard.Description>
          </div>
        </InfoCard.Content>
      </InfoCard>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      <div className="pb-16">
        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
          Available Models
        </h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={!row.original.isEnabled ? 'opacity-50' : ''}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No models found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ApiKeyModal
        model={apiKeyModalModel}
        open={!!apiKeyModalModel}
        onOpenChange={open => {
          if (!open) setApiKeyModalModel(null)
        }}
        onSave={async apiKey => {
          if (apiKeyModalModel) {
            await setApiKey(apiKeyModalModel.id, apiKey)
          }
        }}
      />
    </div>
  )
}
