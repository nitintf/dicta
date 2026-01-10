import { StepProgress } from './step-progress'
import { StepSidebar } from './step-sidebar'
import { useOnboarding } from '../hooks/use-onboarding'

import type { ReactNode } from 'react'

interface OnboardingLayoutProps {
  children: ReactNode
  onBack?: () => void
}

export function OnboardingLayout({ children, onBack }: OnboardingLayoutProps) {
  const { steps, currentStep, previousStep, canGoPrevious } = useOnboarding()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (canGoPrevious()) {
      previousStep()
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div
        data-tauri-drag-region
        className="absolute left-0 right-0 top-0 h-20 z-50"
      />

      <div className="relative p-3">
        <div className="h-full rounded-r-2xl overflow-hidden shadow-sm">
          <StepSidebar
            steps={steps}
            currentStep={currentStep}
            onBack={handleBack}
            canGoPrevious={canGoPrevious()}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="h-full">{children}</div>
        </div>

        <div className="px-8 py-6 flex items-center justify-center">
          <StepProgress totalSteps={steps.length} currentStep={currentStep} />
        </div>
      </div>
    </div>
  )
}
