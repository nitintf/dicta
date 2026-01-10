import { useEffect } from 'react'

import { checkAllPermissions } from '@/lib/permissions'

import { OnboardingLayout } from './components/onboarding-layout'
import {
  WelcomeStep,
  ModelDownloadStep,
  MicrophoneStep,
  AccessibilityStep,
} from './components/steps'
import { useOnboarding } from './hooks/use-onboarding'
import { useOnboardingStore } from './store'

const stepComponents = [
  WelcomeStep,
  ModelDownloadStep,
  MicrophoneStep,
  AccessibilityStep,
]

export function OnboardingPage() {
  const { currentStep, setCurrentStep } = useOnboarding()
  const setPermissions = useOnboardingStore(state => state.setPermissions)

  useEffect(() => {
    setCurrentStep(0)
  }, [setCurrentStep])

  useEffect(() => {
    const initializePermissions = async () => {
      const permissions = await checkAllPermissions()
      setPermissions(permissions)
    }
    void initializePermissions()
  }, [setPermissions])

  const StepComponent = stepComponents[currentStep]

  return (
    <OnboardingLayout>
      <StepComponent />
    </OnboardingLayout>
  )
}
