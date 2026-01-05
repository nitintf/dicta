import { motion } from 'motion/react'

import type { ReactNode } from 'react'

interface VoiceInputContainerProps {
  children: ReactNode
}

export function VoiceInputContainer({ children }: VoiceInputContainerProps) {
  return (
    <div className="flex h-full w-full items-center justify-center border border-zinc-700 rounded-full">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }}
        className="relative flex h-full w-full items-center gap-1.5 rounded-full border border-white/12 bg-linear-to-br from-black via-neutral-950 to-black px-2.5"
      >
        <div className="relative z-10 flex w-full items-center gap-2">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
