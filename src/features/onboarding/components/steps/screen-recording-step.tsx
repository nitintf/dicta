import { Monitor, Check, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/features/settings'
import { usePermissions } from '@/hooks/use-permissions'

import { useOnboarding } from '../../hooks/use-onboarding'

export function ScreenRecordingStep() {
  const navigate = useNavigate()
  const { markStepComplete } = useOnboarding()
  const { permissions, requestScreenCapturePermission } = usePermissions()
  const setOnboardingComplete = useSettingsStore(
    state => state.setOnboardingComplete
  )

  const isGranted = permissions.screenCapture === 'granted'

  useEffect(() => {
    if (isGranted) {
      markStepComplete('screen-recording')
    }
  }, [isGranted, markStepComplete])

  const handleRequest = async () => {
    const granted = await requestScreenCapturePermission()
    if (granted) {
      markStepComplete('screen-recording')
    }
  }

  const handleFinish = async () => {
    await setOnboardingComplete(true)
    navigate('/')
  }

  const handleSkip = async () => {
    await setOnboardingComplete(true)
    navigate('/')
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
          <Monitor size={28} className="text-onboarding-text" strokeWidth={2} />
        </motion.div>

        <h2 className="mb-3 text-center text-2xl font-bold tracking-tight text-onboarding-text">
          Screen Recording
        </h2>

        <p className="mb-6 text-center text-sm text-onboarding-text-muted">
          Optional for advanced features
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
                  Optional Permission
                </h3>
                <p className="text-xs leading-relaxed text-onboarding-text-muted">
                  This permission may be needed for certain advanced features.
                  You can enable it now or skip and enable it later in settings.
                </p>
              </div>
            </div>
          </div>

          {isGranted ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm rounded-lg p-3 text-onboarding-primary bg-onboarding-primary-light">
                <Check size={18} strokeWidth={2.5} />
                <span className="font-medium">
                  Screen recording access granted!
                </span>
              </div>
              <Button onClick={handleFinish} className="w-full h-10 text-sm">
                Finish Setup
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button onClick={handleRequest} className="w-full h-10 text-sm">
                Grant Screen Recording Access
              </Button>
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full hover:bg-gray-100 h-10 text-onboarding-text-muted"
              >
                <X size={14} className="mr-2" />
                Skip for now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
