import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ProtectedRoute } from './components/protected-route'
import { HomePage } from './features/home'
import { OnboardingPage } from './features/onboarding'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
