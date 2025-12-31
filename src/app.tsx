import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AppLayout } from './components/app-layout'
import { ProtectedRoute } from './components/protected-route'
import { HelpPage } from './features/help'
import { HomePageContent } from './features/home'
import { initializeModelStatusListener } from './features/models'
import { ModelsPage } from './features/models'
import { OnboardingPage } from './features/onboarding'
import { SnippetsPage } from './features/snippets'
import { StylesPage } from './features/styles'

import './index.css'

function App() {
  // Initialize model status listener on app mount
  useEffect(() => {
    initializeModelStatusListener()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<HomePageContent />} />
                  <Route path="/snippets" element={<SnippetsPage />} />
                  <Route path="/styles" element={<StylesPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/models" element={<ModelsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
