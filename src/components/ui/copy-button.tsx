import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'

import { Button, ButtonProps } from '@/components/ui/button'
import { useControlledState } from '@/hooks/use-controlled-state'

type CopyButtonProps = ButtonProps & {
  content: string
  copied?: boolean
  onCopiedChange?: (copied: boolean, content?: string) => void
  delay?: number
}

function CopyButton({
  content,
  copied,
  onCopiedChange,
  onClick,
  delay = 3000,
  ...props
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useControlledState({
    value: copied,
    onChange: onCopiedChange,
  })

  const handleCopy = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      if (copied) return
      if (content) {
        writeText(content)
          .then(() => {
            setIsCopied(true)
            onCopiedChange?.(true, content)
            setTimeout(() => {
              setIsCopied(false)
              onCopiedChange?.(false)
            }, delay)
          })
          .catch(error => {
            console.error('Error copying command', error)
          })
      }
    },
    [onClick, copied, content, setIsCopied, onCopiedChange, delay]
  )

  const Icon = isCopied ? CheckIcon : CopyIcon

  return (
    <Button data-slot="copy-button" onClick={handleCopy} {...props}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={isCopied ? 'check' : 'copy'}
          data-slot="copy-button-icon"
          initial={{ scale: 0, opacity: 0.4, filter: 'blur(4px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={{ scale: 0, opacity: 0.4, filter: 'blur(4px)' }}
          transition={{ duration: 0.25 }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

export { CopyButton, type CopyButtonProps }
