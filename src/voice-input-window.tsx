import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { VoiceInput } from '@/features/voice-input/components/voice-input'

import './index.css'

function VoiceInputWindowApp() {
  return (
    <StrictMode>
      <VoiceInput />
    </StrictMode>
  )
}

const rootElement = document.getElementById('voice-input-root')!
const root = ReactDOM.createRoot(rootElement)
root.render(<VoiceInputWindowApp />)
