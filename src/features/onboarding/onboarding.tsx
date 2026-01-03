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
  const { currentStep } = useOnboarding()

  const StepComponent = stepComponents[currentStep]

  return (
    <OnboardingLayout>
      <StepComponent />
    </OnboardingLayout>
  )
}
