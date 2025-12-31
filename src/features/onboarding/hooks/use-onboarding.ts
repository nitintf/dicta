import { useCallback, useMemo } from 'react'

import { useOnboardingStore } from '../store'

export function useOnboarding() {
  const currentStep = useOnboardingStore(state => state.currentStep)
  const steps = useOnboardingStore(state => state.steps)
  const setCurrentStep = useOnboardingStore(state => state.setCurrentStep)
  const nextStep = useOnboardingStore(state => state.nextStep)
  const previousStep = useOnboardingStore(state => state.previousStep)
  const markStepComplete = useOnboardingStore(state => state.markStepComplete)
  const resetOnboarding = useOnboardingStore(state => state.resetOnboarding)

  const currentStepData = useMemo(
    () => steps[currentStep],
    [steps, currentStep]
  )

  const isFirstStep = useMemo(() => currentStep === 0, [currentStep])

  const isLastStep = useMemo(
    () => currentStep === steps.length - 1,
    [currentStep, steps.length]
  )

  const completedSteps = useMemo(
    () => steps.filter(step => step.completed).length,
    [steps]
  )

  const progress = useMemo(
    () => ((currentStep + 1) / steps.length) * 100,
    [currentStep, steps.length]
  )

  const canGoNext = useCallback(() => {
    return !isLastStep
  }, [isLastStep])

  const canGoPrevious = useCallback(() => {
    return !isFirstStep
  }, [isFirstStep])

  const goToStep = useCallback(
    (stepIndex: number) => {
      setCurrentStep(stepIndex)
    },
    [setCurrentStep]
  )

  const completeCurrentStep = useCallback(() => {
    if (currentStepData) {
      markStepComplete(currentStepData.id)
    }
  }, [currentStepData, markStepComplete])

  const completeCurrentStepAndGoNext = useCallback(() => {
    completeCurrentStep()
    if (canGoNext()) {
      nextStep()
    }
  }, [completeCurrentStep, canGoNext, nextStep])

  return {
    // State
    currentStep,
    currentStepData,
    steps,
    isFirstStep,
    isLastStep,
    completedSteps,
    progress,

    // Actions
    nextStep,
    previousStep,
    goToStep,
    completeCurrentStep,
    completeCurrentStepAndGoNext,
    markStepComplete,
    resetOnboarding,
    canGoNext,
    canGoPrevious,
  }
}
