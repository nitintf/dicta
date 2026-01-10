import { Lock, Check, AlertCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/use-permissions'

import { useOnboarding } from '../../hooks/use-onboarding'
import { useOnboardingStore } from '../../store'

export function AccessibilityStep() {
  const { completeCurrentStepAndGoNext, markStepComplete } = useOnboarding()
  const { permissions, requestAccessibilityPermission, checkPermissions } =
    usePermissions()
  const storedPermissions = useOnboardingStore(state => state.permissions)

  const effectivePermissions = useMemo(() => {
    return storedPermissions || permissions
  }, [storedPermissions, permissions])

  const isGranted = effectivePermissions.accessibility === 'granted'
  const isDenied = effectivePermissions.accessibility === 'denied'
  const isUnknown = effectivePermissions.accessibility === 'unknown'

  useEffect(() => {
    if (!storedPermissions) {
      const refreshPermissions = async () => {
        await checkPermissions()
      }
      void refreshPermissions()
    }

    const interval = setInterval(() => {
      void checkPermissions()
    }, 2000)

    return () => clearInterval(interval)
  }, [checkPermissions, storedPermissions])

  const handleRequest = async () => {
    const granted = await requestAccessibilityPermission()
    // Recheck permissions after request
    await checkPermissions()
    if (granted) {
      markStepComplete('accessibility')
    }
  }

  const handleCheckAgain = async () => {
    // Force a fresh permission check
    await checkPermissions()
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
          className="mx-auto mb-8 flex size-16 items-center justify-center rounded-full border-2 border-border bg-background"
        >
          <Lock size={28} className="text-foreground" strokeWidth={2} />
        </motion.div>

        <h2 className="mb-3 text-center text-2xl font-bold tracking-tight text-foreground">
          Accessibility Access
        </h2>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          Required for global shortcuts
        </p>

        <div className="space-y-6">
          <div className="rounded-xl border border-border p-5 bg-muted/50">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
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
                <h3 className="font-medium mb-1.5 text-sm text-foreground">
                  Why we need this
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  This allows Dicta to respond to keyboard shortcuts even when
                  the app is in the background, making it quick and easy to
                  start transcribing anytime.
                </p>
              </div>
            </div>
          </div>

          {isGranted ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm rounded-lg p-3 text-primary bg-primary/10">
                <Check size={18} strokeWidth={2.5} />
                <span className="font-medium">
                  Accessibility access granted!
                </span>
              </div>
              <Button onClick={handleContinue} className="w-full h-10 text-sm">
                Continue →
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle
                    className="text-amber-600 shrink-0 mt-0.5"
                    size={18}
                    strokeWidth={2.5}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-amber-800 mb-1 text-sm">
                      {isUnknown
                        ? 'Checking accessibility access...'
                        : "You don't have access"}
                    </p>
                    <p className="text-xs text-amber-700">
                      {isDenied
                        ? 'Please enable accessibility access in System Settings → Privacy & Security → Accessibility'
                        : isUnknown
                          ? 'If you already granted access, click "Check Again" below. Otherwise, click "Access" to open System Settings.'
                          : 'Click the button below to grant accessibility access'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isUnknown && (
                  <Button
                    onClick={handleCheckAgain}
                    variant="outline"
                    className="flex-1 h-10 text-sm"
                  >
                    Check Again
                  </Button>
                )}
                <Button
                  onClick={handleRequest}
                  className={
                    isUnknown ? 'flex-1 h-10 text-sm' : 'w-full h-10 text-sm'
                  }
                >
                  {isUnknown ? 'Open System Settings' : 'Access'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
