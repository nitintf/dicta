import {
  ModelActionsMenu,
  ModelCell,
  ModelConfigStatus,
  ModelTypeBadge,
} from '../components/table'

import type { TranscriptionModel } from '../types'
import type { ColumnDef } from '@tanstack/react-table'

export interface ColumnActions {
  downloading: string | null
  onSelectModel: (id: string) => void
  onSetApiKey: (model: TranscriptionModel) => void
  onRemoveApiKey: (id: string) => void
  onDownloadModel: (model: TranscriptionModel) => void
  onDeleteModel: (model: TranscriptionModel) => void
  onRefreshStatus: (id: string) => Promise<void>
  onStartModel: (id: string) => Promise<void>
  onStopModel: (id: string) => Promise<void>
}

export function createModelColumns(
  actions: ColumnActions
): ColumnDef<TranscriptionModel>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Model',
      size: 400,
      minSize: 300,
      cell: ({ row }) => (
        <ModelCell
          model={row.original}
          onRefreshStatus={actions.onRefreshStatus}
          showSelectedIndicator
        />
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      size: 100,
      minSize: 100,
      maxSize: 100,
      cell: ({ row }) => <ModelTypeBadge type={row.original.type} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'apiKey',
      header: 'Status',
      size: 150,
      minSize: 150,
      maxSize: 200,
      cell: ({ row }) => <ModelConfigStatus model={row.original} />,
    },
    {
      id: 'actions',
      header: '',
      size: 60,
      minSize: 60,
      maxSize: 60,
      cell: ({ row }) => (
        <ModelActionsMenu
          model={row.original}
          downloading={actions.downloading}
          onSelectModel={actions.onSelectModel}
          onSetApiKey={actions.onSetApiKey}
          onRemoveApiKey={actions.onRemoveApiKey}
          onDownloadModel={actions.onDownloadModel}
          onDeleteModel={actions.onDeleteModel}
          onStartModel={actions.onStartModel}
          onStopModel={actions.onStopModel}
        />
      ),
    },
  ]
}
