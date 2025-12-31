import { Navigate } from 'react-router-dom'

import { useSettingsStore } from '@/features/settings'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const initialized = useSettingsStore(state => state.initialized)
  const onboardingComplete = useSettingsStore(
    state => state.settings.onboarding.completed
  )

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
