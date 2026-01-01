import { Wifi, WifiOff } from 'lucide-react'

interface ModelConnectivityProps {
  type: string
}

export function ModelConnectivity({ type }: ModelConnectivityProps) {
  const requiresConnection = type === 'cloud'

  if (requiresConnection) {
    return (
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-muted-foreground">Online</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <WifiOff className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-muted-foreground">Offline</span>
    </div>
  )
}
