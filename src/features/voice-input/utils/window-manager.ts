import { getCurrentWindow } from '@tauri-apps/api/window'

import type { FeedbackMessage } from './types'

/**
 * Hides the voice input window
 */
export async function hideVoiceInputWindow(): Promise<void> {
  const currentWindow = getCurrentWindow()
  try {
    await currentWindow.hide()
  } catch (error) {
    console.error('Failed to hide window:', error)
  }
}

/**
 * Shows feedback message for a duration then hides the window
 */
export async function showFeedbackAndHide(
  setFeedbackMessage: (message: FeedbackMessage) => void,
  message: FeedbackMessage,
  duration: number
): Promise<void> {
  setFeedbackMessage(message)
  await new Promise(resolve => setTimeout(resolve, duration))
  setFeedbackMessage(null)
  await hideVoiceInputWindow()
}

/**
 * Delays execution for a specified duration
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
