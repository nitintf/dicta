import { useEffect } from 'react'

import { OnboardingLayout } from './components/onboarding-layout'
import {
  WelcomeStep,
  ModelDownloadStep,
  MicrophoneStep,
  AccessibilityStep,
} from './components/steps'
import { useOnboarding } from './hooks/use-onboarding'

const stepComponents = [
  WelcomeStep,
  ModelDownloadStep,
  MicrophoneStep,
  AccessibilityStep,
]

export function OnboardingPage() {
  const { currentStep, setCurrentStep } = useOnboarding()

  // Always start from step 0 when onboarding page is mounted
  useEffect(() => {
    setCurrentStep(0)
  }, [setCurrentStep])

  const StepComponent = stepComponents[currentStep]

  return (
    <OnboardingLayout>
      <StepComponent />
    </OnboardingLayout>
  )
}
