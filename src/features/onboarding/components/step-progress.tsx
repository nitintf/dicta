import { motion } from 'motion/react'

interface StepProgressProps {
  totalSteps: number
  currentStep: number
}

export function StepProgress({ totalSteps, currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <div key={index} className="h-1.5 w-16 overflow-hidden rounded-full">
            {isCompleted || isCurrent ? (
              <motion.div
                className="h-full rounded-full bg-onboarding-primary"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: isCurrent ? 0.1 : 0,
                }}
              />
            ) : (
              <div className="h-full w-full rounded-full bg-onboarding-border" />
            )}
          </div>
        )
      })}
    </div>
  )
}
