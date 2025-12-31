import { StrictMode, useState } from 'react'
import ReactDOM from 'react-dom/client'

import { VoiceInput } from './components/voice-input'
import { useTauriEvent } from '../../hooks/use-tauri-event'

import '../../index.css'

function VoiceInputWindowApp() {
  // Use a session key that changes every time the window is shown
  // This forces React to completely unmount and remount the component
  const [sessionKey, setSessionKey] = useState(0)

  useTauriEvent<void>('show_voice_input', () => {
    setSessionKey(prev => prev + 1)
  })

  return (
    <StrictMode>
      <VoiceInput key={sessionKey} />
    </StrictMode>
  )
}

const rootElement = document.getElementById('voice-input-root')!
const root = ReactDOM.createRoot(rootElement)
root.render(<VoiceInputWindowApp />)
