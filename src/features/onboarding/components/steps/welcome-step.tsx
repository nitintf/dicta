import { Rocket } from 'lucide-react'
import { motion } from 'motion/react'

import { Button } from '@/components/ui/button'

import { useOnboarding } from '../../hooks/use-onboarding'

export function WelcomeStep() {
  const { completeCurrentStepAndGoNext } = useOnboarding()

  return (
    <div className="flex h-full items-center justify-center px-16 py-12">
      <div className="max-w-lg text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          className="mx-auto mb-8 flex size-16 items-center justify-center rounded-full border-2 border-border bg-background"
        >
          <Rocket size={28} className="text-foreground" strokeWidth={2} />
        </motion.div>

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
          Welcome to Dicta!
        </h1>

        <p className="mb-6 text-sm leading-relaxed max-w-md mx-auto text-muted-foreground">
          Your powerful voice-to-text companion. Transform your thoughts into
          text instantly.
        </p>

        <div className="mb-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Fast & Accurate
          </div>
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secure & Private
          </div>
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Lightning Quick
          </div>
        </div>

        <Button
          onClick={completeCurrentStepAndGoNext}
          className="px-6 h-10 text-sm"
        >
          Get Started →
        </Button>
      </div>
    </div>
  )
}
