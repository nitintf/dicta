import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './app'
import { initializeSettings } from './features/settings'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

// Initialize settings before rendering the app
initializeSettings().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
