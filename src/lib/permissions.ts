import {
  requestMicrophonePermission,
  checkMicrophonePermission,
  requestAccessibilityPermission,
  checkAccessibilityPermission,
  requestScreenRecordingPermission,
  checkScreenRecordingPermission,
} from 'tauri-plugin-macos-permissions-api'

export type PermissionStatus = 'granted' | 'denied' | 'unknown'

export interface Permission {
  id: string
  name: string
  description: string
  status: PermissionStatus
  required: boolean
}

export interface PermissionsState {
  microphone: PermissionStatus
  accessibility: PermissionStatus
  screenCapture: PermissionStatus
}

export async function checkAllPermissions(): Promise<PermissionsState> {
  try {
    const [microphone, accessibility, screenCapture] = await Promise.all([
      checkMicrophonePermission(),
      checkAccessibilityPermission(),
      checkScreenRecordingPermission(),
    ])

    // Log permission status for debugging
    console.log('Permission check results:', {
      microphone,
      accessibility,
      screenCapture,
    })

    // For accessibility, if check returns false, it might still be granted
    // but the plugin might not detect it correctly. We'll treat it as 'unknown'
    // so the UI can show a "Check Again" option
    return {
      microphone: microphone ? 'granted' : 'denied',
      accessibility: accessibility ? 'granted' : 'unknown',
      screenCapture: screenCapture ? 'granted' : 'denied',
    }
  } catch (error) {
    console.error('Error checking permissions:', error)
    return {
      microphone: 'unknown',
      accessibility: 'unknown',
      screenCapture: 'unknown',
    }
  }
}

export async function requestMicPermission(): Promise<boolean> {
  try {
    console.log('Requesting microphone permission...')
    await requestMicrophonePermission()
    const hasPermission = await checkMicrophonePermission()
    console.log('Microphone permission status:', hasPermission)
    return hasPermission
  } catch (error) {
    console.error('Error requesting microphone permission:', error)
    return false
  }
}

export async function requestAccessibility(): Promise<boolean> {
  try {
    console.log('Requesting accessibility permission...')

    // First check if permission is already granted
    const alreadyGranted = await checkAccessibilityPermission()
    if (alreadyGranted) {
      console.log('Accessibility permission already granted')
      return true
    }

    // Request permission (this will open System Settings if not granted)
    await requestAccessibilityPermission()

    // Wait longer for the system to update the permission status
    // macOS can take a moment to update the permission database
    await new Promise(resolve => setTimeout(resolve, 1000))

    const hasPermission = await checkAccessibilityPermission()
    console.log('Accessibility permission status after request:', hasPermission)

    // If still not granted, wait a bit more and check again (user might be granting it)
    if (!hasPermission) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const recheck = await checkAccessibilityPermission()
      console.log('Accessibility permission status after recheck:', recheck)
      return recheck
    }

    return hasPermission
  } catch (error) {
    console.error('Error requesting accessibility permission:', error)
    // Even if there's an error, check one more time - permission might have been granted
    try {
      const finalCheck = await checkAccessibilityPermission()
      console.log(
        'Final accessibility permission check after error:',
        finalCheck
      )
      return finalCheck
    } catch {
      return false
    }
  }
}

export async function requestScreenCapture(): Promise<boolean> {
  try {
    await requestScreenRecordingPermission()
    return await checkScreenRecordingPermission()
  } catch (error) {
    console.error('Error requesting screen capture permission:', error)
    return false
  }
}

export function areRequiredPermissionsGranted(
  permissions: PermissionsState
): boolean {
  // Microphone and Accessibility are required for voice input and global shortcuts
  return (
    permissions.microphone === 'granted' &&
    permissions.accessibility === 'granted'
  )
}
