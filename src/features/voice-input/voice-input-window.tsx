import { StrictMode, useRef } from 'react'
import ReactDOM from 'react-dom/client'

import { VoiceInput, type VoiceInputHandle } from './components/voice-input'
import { useTauriEvent } from '../../hooks/use-tauri-event'

import '../../index.css'

function VoiceInputWindowApp() {
  const voiceInputRef = useRef<VoiceInputHandle>(null)

  useTauriEvent<void>('show_voice_input', () => {
    voiceInputRef.current?.start()
  })

  return (
    <StrictMode>
      <VoiceInput ref={voiceInputRef} />
    </StrictMode>
  )
}

const rootElement = document.getElementById('voice-input-root')!
const root = ReactDOM.createRoot(rootElement)
root.render(<VoiceInputWindowApp />)
