import { listen } from '@tauri-apps/api/event'
import { StrictMode, useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

import { VoiceInput } from './components/voice-input'

import '../../index.css'

function VoiceInputWindowApp() {
  // Use a session key that changes every time the window is shown
  // This forces React to completely unmount and remount the component
  const [sessionKey, setSessionKey] = useState(0)

  useEffect(() => {
    let unlisten: (() => void) | undefined

    const setupListener = async () => {
      // Listen for window show events to reset the session
      unlisten = await listen('show_voice_input', () => {
        console.log('Window shown, incrementing session key to force remount')
        setSessionKey(prev => prev + 1)
      })
    }

    setupListener()

    return () => {
      unlisten?.()
    }
  }, [])

  return (
    <StrictMode>
      <VoiceInput key={sessionKey} />
    </StrictMode>
  )
}

const rootElement = document.getElementById('voice-input-root')!
const root = ReactDOM.createRoot(rootElement)
root.render(<VoiceInputWindowApp />)
