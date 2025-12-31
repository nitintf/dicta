import { Loader, Square } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

interface StopButtonProps {
  onClick: () => void
  isRecording: boolean
  isProcessing: boolean
}

export function StopButton({
  onClick,
  isRecording,
  isProcessing,
}: StopButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        'relative h-5 w-5 shrink-0 rounded-full text-white bg-rose-400 hover:bg-rose-300',
        {
          'bg-neutral-500 hover:bg-neutral-600 cursor-wait': isProcessing,
          'opacity-40 cursor-not-allowed': !isRecording || isProcessing,
        }
      )}
      aria-label={isProcessing ? 'Processing' : 'Finish and Paste'}
      disabled={!isRecording || isProcessing}
    >
      {isProcessing ? (
        <Loader className="size-2.5 animate-spin" strokeWidth={2.5} />
      ) : (
        <Square className="size-2.5 fill-current" />
      )}
    </Button>
  )
}
