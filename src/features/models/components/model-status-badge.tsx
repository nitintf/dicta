import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
  LucideIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import type { ModelStatus } from '../types'

interface ModelStatusBadgeProps {
  status: ModelStatus
  className?: string
}

interface StatusConfig {
  icon: LucideIcon
  label: string
  variant: 'secondary' | 'default' | 'destructive'
  animate: boolean
  className?: string
}

export function ModelStatusBadge({ status, className }: ModelStatusBadgeProps) {
  const config: Record<ModelStatus, StatusConfig> = {
    stopped: {
      icon: Circle,
      label: 'Stopped',
      variant: 'secondary' as const,
      animate: false,
      className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    },
    loading: {
      icon: Loader2,
      label: 'Loading...',
      variant: 'default' as const,
      animate: true,
      className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    },
    ready: {
      icon: CheckCircle2,
      label: 'Running',
      variant: 'default' as const,
      animate: false,
      className: 'bg-green-500/10 text-green-600 border-green-500/20',
    },
    error: {
      icon: AlertCircle,
      label: 'Error',
      variant: 'destructive' as const,
      animate: false,
    },
  }

  const statusConfig = config[status]
  const Icon = statusConfig.icon

  return (
    <Badge
      variant={statusConfig.variant}
      className={`gap-1.5 ${statusConfig.className || ''} ${className || ''}`}
    >
      <Icon
        className={`w-3 h-3 ${statusConfig.animate ? 'animate-spin' : ''}`}
      />
      <span className="text-xs font-medium">{statusConfig.label}</span>
    </Badge>
  )
}
