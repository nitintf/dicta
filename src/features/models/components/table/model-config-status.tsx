import { Badge } from '@/components/ui/badge'

import type { TranscriptionModel } from '../../types'

interface ModelConfigStatusProps {
  model: TranscriptionModel
}

export function ModelConfigStatus({ model }: ModelConfigStatusProps) {
  // Local model status
  if (model.type === 'local') {
    return model.isDownloaded ? (
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

  // API key required models
  if (model.requiresApiKey) {
    return model.hasApiKey ? (
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

  // Ready models
  return (
    <Badge
      variant="outline"
      className="bg-green-50 text-green-700 border-green-200"
    >
      Ready
    </Badge>
  )
}
