import { Badge } from '@/components/ui/badge'

import { getTypeBadgeConfig } from '../../utils'

interface ModelTypeBadgeProps {
  type: string
}

export function ModelTypeBadge({ type }: ModelTypeBadgeProps) {
  const config = getTypeBadgeConfig(type)

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
