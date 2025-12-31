export interface PermissionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  status: 'granted' | 'denied' | 'unknown'
  onRequest: () => Promise<boolean>
  required?: boolean
}
