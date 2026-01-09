import { emit } from '@tauri-apps/api/event'

export type ToastType = 'info' | 'success' | 'error' | 'warning'

export interface ToastMessage {
  message: string
  type?: ToastType
  undoAction?: boolean
}

export async function showToast(message: string, type: ToastType = 'info') {
  await emit('show_toast', { message, type })
}

export async function hideToast() {
  await emit('hide_toast', {})
}
