import { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface SettingsPanelProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function SettingsPanel({
  title,
  description,
  children,
  className,
}: SettingsPanelProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  )
}

interface SettingItemProps {
  title: string
  description?: string
  action?: ReactNode
  children?: ReactNode
}

export function SettingItem({
  title,
  description,
  action,
  children,
}: SettingItemProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1 space-y-1">
        <h3 className="text-sm font-medium leading-none">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children && <div className="pt-2">{children}</div>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export function SettingsSection({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      )}
      <div className="divide-y">{children}</div>
    </div>
  )
}
