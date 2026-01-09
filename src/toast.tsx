import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react'
import { StrictMode, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'

import { useTauriEvent } from './hooks/use-tauri-event'

import './index.css'

interface ToastMessage {
  message: string
  type?: 'info' | 'success' | 'error' | 'warning'
}

function ToastWindowApp() {
  const [message, setMessage] = useState<string>('')
  const [type, setType] = useState<'info' | 'success' | 'error' | 'warning'>(
    'info'
  )
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const [toastKey, setToastKey] = useState(0) // Add key to track different toasts
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const windowRef = useRef(getCurrentWebviewWindow())

  // Cleanup function
  const cleanup = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  useTauriEvent<ToastMessage>('show_toast', async event => {
    // Cleanup any existing timers
    cleanup()

    // Reset state completely for new toast
    setToastKey(prev => prev + 1)
    setMessage(event.payload.message)
    setType(event.payload.type || 'info')
    setProgress(100)
    setVisible(true)

    await windowRef.current.show()

    // Start progress bar animation
    const duration = 3000
    const interval = 16 // ~60fps
    const decrement = (100 / duration) * interval

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - decrement
        if (newProgress <= 0) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
            progressIntervalRef.current = null
          }
          return 0
        }
        return newProgress
      })
    }, interval)
  })

  useTauriEvent<void>('hide_toast', async () => {
    cleanup()
    setVisible(false)
    setProgress(100) // Reset progress
    await windowRef.current.hide()
  })

  // Hide window when progress reaches 0
  useEffect(() => {
    if (progress === 0 && visible) {
      const timer = setTimeout(async () => {
        setVisible(false)
        await windowRef.current.hide()
        // Reset progress after hiding
        setTimeout(() => setProgress(100), 300)
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [progress, visible])

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  const getIcon = () => {
    const iconClass = 'w-5 h-5 flex-shrink-0'
    switch (type) {
      case 'success':
        return <CircleCheck className={`${iconClass} text-emerald-500`} />
      case 'error':
        return <CircleX className={`${iconClass} text-red-500`} />
      case 'warning':
        return <TriangleAlert className={`${iconClass} text-amber-500`} />
      default:
        return <Info className={`${iconClass} text-blue-500`} />
    }
  }

  if (!visible) return null

  return (
    <div
      key={toastKey}
      className="w-full relative h-full flex flex-col bg-linear-to-br from-black via-neutral-950 to-black rounded-lg border shadow-lg overflow-hidden border-zinc-700"
    >
      <div className="flex-1 flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getIcon()}
          <p className="text-sm font-medium text-white flex-1 truncate">
            {message}
          </p>
        </div>

        <div className="w-full h-1 bg-transparent overflow-hidden absolute bottom-0 left-0">
          <div
            className="h-full bg-primary transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('toast-root')!
const root = ReactDOM.createRoot(rootElement)
root.render(
  <StrictMode>
    <ToastWindowApp />
  </StrictMode>
)
