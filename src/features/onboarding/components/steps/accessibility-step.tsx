import { Lock, Check, AlertCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/use-permissions'

import { useOnboarding } from '../../hooks/use-onboarding'

export function AccessibilityStep() {
  const { completeCurrentStepAndGoNext, markStepComplete } = useOnboarding()
  const { permissions, requestAccessibilityPermission } = usePermissions()

  const isGranted = permissions.accessibility === 'granted'
  const isDenied = permissions.accessibility === 'denied'

  useEffect(() => {
    if (isGranted) {
      markStepComplete('accessibility')
    }
  }, [isGranted, markStepComplete])

  const handleRequest = async () => {
    const granted = await requestAccessibilityPermission()
    if (granted) {
      markStepComplete('accessibility')
    }
  }

  const handleContinue = () => {
    if (isGranted) {
      completeCurrentStepAndGoNext()
    }
  }

  return (
    <div className="flex h-full items-center justify-center px-16 py-12">
      <div className="max-w-xl w-full">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          className="mx-auto mb-8 flex size-16 items-center justify-center rounded-full border-2 border-onboarding-border bg-onboarding-bg"
        >
          <Lock size={28} className="text-onboarding-text" strokeWidth={2} />
        </motion.div>

        <h2 className="mb-3 text-center text-2xl font-bold tracking-tight text-onboarding-text">
          Accessibility Access
        </h2>

        <p className="mb-6 text-center text-sm text-onboarding-text-muted">
          Required for global shortcuts
        </p>

        <div className="space-y-6">
          <div className="rounded-xl border border-onboarding-border p-5 bg-gray-50/50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1.5 text-sm text-onboarding-text">
                  Why we need this
                </h3>
                <p className="text-xs leading-relaxed text-onboarding-text-muted">
                  This allows Dicta to respond to keyboard shortcuts even when
                  the app is in the background, making it quick and easy to
                  start transcribing anytime.
                </p>
              </div>
            </div>
          </div>

          {isGranted ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm rounded-lg p-3 text-onboarding-primary bg-onboarding-primary-light">
                <Check size={18} strokeWidth={2.5} />
                <span className="font-medium">
                  Accessibility access granted!
                </span>
              </div>
              <Button onClick={handleContinue} className="w-full h-10 text-sm">
                Continue →
              </Button>
            </div>
          ) : isDenied ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle
                    className="text-red-500 shrink-0 mt-0.5"
                    size={18}
                    strokeWidth={2.5}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-red-700 mb-1 text-sm">
                      Permission denied
                    </p>
                    <p className="text-xs text-red-600">
                      Please enable accessibility access in System Settings
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleRequest}
                variant="outline"
                className="w-full h-10 text-sm"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <Button onClick={handleRequest} className="w-full h-10 text-sm">
              Grant Accessibility Access
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
