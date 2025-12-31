import { useCallback, useEffect, useState } from 'react'

import {
  checkAllPermissions,
  requestMicPermission,
  requestAccessibility,
  requestScreenCapture,
  areRequiredPermissionsGranted,
  type PermissionsState,
} from '@/lib/permissions'

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionsState>({
    microphone: 'unknown',
    accessibility: 'unknown',
    screenCapture: 'unknown',
  })
  const [loading, setLoading] = useState(true)

  const checkPermissions = useCallback(async () => {
    setLoading(true)
    const status = await checkAllPermissions()
    setPermissions(status)
    setLoading(false)
    return status
  }, [])

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

  const requestScreenCapturePermission = async () => {
    const granted = await requestScreenCapture()
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
    requestScreenCapturePermission,
    checkPermissions,
  }
}
