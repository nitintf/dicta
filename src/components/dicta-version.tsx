import { CloudCheck } from 'lucide-react'

import { appConfig } from '@/config'

export const DictaVersion = () => {
  return (
    <div className="px-2 py-2 text-xs text-muted-foreground flex items-center justify-between">
      Dicta v{appConfig.version}
      <div>
        <CloudCheck className="h-4 w-4" />
      </div>
    </div>
  )
}
