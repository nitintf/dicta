import { cn } from '@/lib/cn'

import type { ReactNode } from 'react'

interface InfoCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'accent'
}

export function InfoCard({
  children,
  className,
  variant = 'default',
}: InfoCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-8 transition-colors',
        variant === 'default' &&
          'bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200',
        variant === 'accent' &&
          'bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20',
        className
      )}
    >
      {children}
    </div>
  )
}

InfoCard.Title = function InfoCardTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h3 className={cn('text-xl font-semibold text-foreground mb-3', className)}>
      {children}
    </h3>
  )
}

InfoCard.Description = function InfoCardDescription({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    >
      {children}
    </p>
  )
}

InfoCard.Content = function InfoCardContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('space-y-4', className)}>{children}</div>
}
