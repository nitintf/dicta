import { Mic, Lock, Monitor, Rocket, Download } from 'lucide-react'
import { motion } from 'motion/react'

import { DictaLogo } from '@/components/ui/dicta-logo'
import { MicrophoneIllustration } from '@/components/ui/microphone-illustration'
import { cn } from '@/lib/cn'

import type { OnboardingStep } from '../store'

const iconMap = {
  mic: Mic,
  lock: Lock,
  monitor: Monitor,
  rocket: Rocket,
  download: Download,
}

interface StepSidebarProps {
  steps: OnboardingStep[]
  currentStep: number
  onBack?: () => void
  canGoPrevious?: boolean
}

export function StepSidebar({
  steps,
  currentStep,
  onBack,
  canGoPrevious,
}: StepSidebarProps) {
  return (
    <div className="w-80 h-full px-2 py-2 flex flex-col bg-sidebar relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <MicrophoneIllustration className="text-onboarding-text absolute -right-8 top-0 w-full h-full" />
      </div>

      <div className="mb-16 pt-12 pl-2 relative z-10">
        <h2 className="text-xl font-bold flex items-center gap-2.5 text-primary">
          <DictaLogo size={28} className="text-primary" />
          <span className="text-primary">Dicta</span>
        </h2>
      </div>

      <div className="relative pl-2 flex-1 z-10">
        {steps.map((step, index) => {
          const Icon = iconMap[step.icon]
          const isActive = index === currentStep
          const isPast = index < currentStep
          const isFuture = index > currentStep
          const showLine = index < steps.length - 1

          return (
            <div key={step.id} className="relative">
              <div className="relative w-full text-left mb-8">
                <div className="flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all z-10',
                        isActive &&
                          'border-primary bg-primary shadow-lg shadow-primary/20',
                        isPast && !isActive && 'border-primary bg-primary/10',
                        isFuture && 'border-gray-500/50 bg-transparent'
                      )}
                    >
                      <Icon
                        size={16}
                        strokeWidth={2.5}
                        className={cn(
                          isActive && 'text-primary-foreground',
                          isPast && !isActive && 'text-primary',
                          isFuture && 'text-gray-500'
                        )}
                      />
                    </div>

                    {showLine && (
                      <div className="absolute top-[2.4rem] left-1/2 -translate-x-1/2 w-0.5 h-13 bg-gray-500/30">
                        <motion.div
                          className="w-full h-full origin-top bg-primary"
                          initial={{ scaleY: 0 }}
                          animate={{
                            scaleY: isPast ? 1 : 0,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: 'easeOut',
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 pt-1.5">
                    <h3
                      className={cn(
                        'font-semibold text-base mb-1.5 leading-snug',
                        (isActive || isPast) && 'text-foreground',
                        isFuture && 'text-gray-500'
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={cn(
                        'text-sm leading-relaxed',
                        (isActive || isPast) && 'text-muted-foreground',
                        isFuture && 'text-gray-500/70'
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Back button at bottom */}
      {canGoPrevious && onBack && (
        <div className="pt-6 pl-1 pb-3 relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </button>
        </div>
      )}
    </div>
  )
}
