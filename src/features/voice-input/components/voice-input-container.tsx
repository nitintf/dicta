import { motion } from 'motion/react'

import type { ReactNode } from 'react'

interface VoiceInputContainerProps {
  children: ReactNode
}

export function VoiceInputContainer({ children }: VoiceInputContainerProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-1">
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
        {/* Subtle inner highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-b from-white/3 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex w-full items-center gap-1.5">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
