import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface CancelButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function CancelButton({ onClick, disabled }: CancelButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className="h-5 w-5 shrink-0 rounded-full bg-white/25 text-white hover:bg-white/30 transition-all duration-200 border border-white/10 shadow-lg disabled:opacity-50 disabled:bg-white/10"
      aria-label="Cancel"
      disabled={disabled}
    >
      <X className="size-3" strokeWidth={2.5} />
    </Button>
  )
}
