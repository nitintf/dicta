import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { PermissionsState } from '@/lib/permissions'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: 'mic' | 'lock' | 'monitor' | 'rocket' | 'download'
  completed: boolean
}

interface OnboardingState {
  currentStep: number
  steps: OnboardingStep[]
  permissions: PermissionsState | null

  // Actions
  setCurrentStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  markStepComplete: (stepId: string) => void
  setPermissions: (permissions: PermissionsState) => void
  resetOnboarding: () => void
}

const initialSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Dicta!',
    description: 'Get up and running in 3 minutes',
    icon: 'rocket',
    completed: false,
  },
  {
    id: 'model-download',
    title: 'Download AI Model',
    description: 'Required for offline transcription',
    icon: 'download',
    completed: false,
  },
  {
    id: 'microphone',
    title: 'Microphone Access',
    description: 'Required for voice input',
    icon: 'mic',
    completed: false,
  },
  {
    id: 'accessibility',
    title: 'Accessibility Access',
    description: 'Required for global shortcuts',
    icon: 'lock',
    completed: false,
  },
]

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      steps: initialSteps,
      permissions: null,

      setCurrentStep: (step: number) => {
        const { steps } = get()
        if (step >= 0 && step < steps.length) {
          set({ currentStep: step })
        }
      },

      nextStep: () => {
        const { currentStep, steps } = get()
        if (currentStep < steps.length - 1) {
          set({ currentStep: currentStep + 1 })
        }
      },

      previousStep: () => {
        const { currentStep } = get()
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 })
        }
      },

      markStepComplete: (stepId: string) => {
        set(state => ({
          steps: state.steps.map(step =>
            step.id === stepId ? { ...step, completed: true } : step
          ),
        }))
      },

      setPermissions: (permissions: PermissionsState) => {
        set({ permissions })
      },

      resetOnboarding: () => {
        set({
          currentStep: 0,
          steps: initialSteps,
          permissions: null,
        })
      },
    }),
    {
      name: 'dicta-onboarding',
      partialize: state => ({
        currentStep: state.currentStep,
        steps: state.steps,
        // Don't persist permissions - always check fresh on mount
      }),
    }
  )
)
