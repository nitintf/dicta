import { Pencil, Trash2 } from 'lucide-react'
import { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

interface VibeCardProps {
  id: string
  name: string
  description: string
  isSelected: boolean
  isDefault: boolean
  showActions: boolean
  preview: ReactNode
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function VibeCard({
  name,
  description,
  isSelected,
  isDefault,
  showActions,
  preview,
  onSelect,
  onEdit,
  onDelete,
}: VibeCardProps) {
  return (
    <div
      className={cn(
        'relative p-6 rounded-2xl border-2 transition-all cursor-pointer group',
        'hover:shadow-lg',
        isSelected
          ? 'border-primary shadow-md'
          : 'border-border hover:border-border/80'
      )}
      onClick={onSelect}
    >
      {!isDefault && showActions && (
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={e => {
              e.stopPropagation()
              onEdit?.()
            }}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={e => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <h3 className="text-3xl font-serif mb-2">{name}</h3>

      <p className="text-sm font-medium text-foreground/70 mb-6">
        {description}
      </p>

      <div className="mb-6">{preview}</div>
    </div>
  )
}
