import { useCallback, useEffect, useState } from 'react'

import { useOnboardingStore } from '@/features/onboarding/store'
import {
  checkAllPermissions,
  requestMicPermission,
  requestAccessibility,
  areRequiredPermissionsGranted,
  type PermissionsState,
} from '@/lib/permissions'

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionsState>({
    microphone: 'unknown',
    accessibility: 'unknown',
  })
  const [loading, setLoading] = useState(true)
  const setOnboardingPermissions = useOnboardingStore(
    state => state.setPermissions
  )

  const checkPermissions = useCallback(async () => {
    setLoading(true)
    const status = await checkAllPermissions()
    setPermissions(status)
    // Also update onboarding store if we're in onboarding context
    setOnboardingPermissions(status)
    setLoading(false)
    return status
  }, [setOnboardingPermissions])

  const requestMicrophone = async () => {
    const granted = await requestMicPermission()
    await checkPermissions()
    return granted
  }

  const requestAccessibilityPermission = async () => {
    const granted = await requestAccessibility()
    await checkPermissions()
    return granted
  }

  useEffect(() => {
    async function checkPermissionsFn() {
      await checkPermissions()
    }
    void checkPermissionsFn()
  }, [checkPermissions])

  return {
    permissions,
    loading,
    allGranted: areRequiredPermissionsGranted(permissions),
    requestMicrophone,
    requestAccessibilityPermission,
    checkPermissions,
  }
}
