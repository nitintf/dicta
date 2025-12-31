import { Routes, Route, Navigate } from 'react-router-dom'

import { HomeLayout } from './components/home-layout'
import { HelpPage } from './pages/help-page'
import { HomePage as HomePageContent } from './pages/home-page'
import { SnippetsPage } from './pages/snippets-page'
import { StylesPage } from './pages/styles-page'

export function HomePage() {
  return (
    <HomeLayout>
      <Routes>
        <Route path="/" element={<HomePageContent />} />
        <Route path="/snippets" element={<SnippetsPage />} />
        <Route path="/styles" element={<StylesPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HomeLayout>
  )
}
