import { OnboardingLayout } from './components/onboarding-layout'
import {
  WelcomeStep,
  MicrophoneStep,
  AccessibilityStep,
  ScreenRecordingStep,
} from './components/steps'
import { useOnboarding } from './hooks/use-onboarding'

const stepComponents = [
  WelcomeStep,
  MicrophoneStep,
  AccessibilityStep,
  ScreenRecordingStep,
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
