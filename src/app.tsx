import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react'
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
import { VibesPage } from './features/vibes'
import { VocabularyPage } from './features/vocabulary'
import { ThemeProvider } from './providers/theme-provider'

import './index.css'

function App() {
  useEffect(() => {
    initializeModelStatusListener()
  }, [])

  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          gap={8}
          closeButton
          icons={{
            success: <CircleCheck className="size-[18px] text-emerald-500" />,
            error: <CircleX className="size-[18px] text-red-500" />,
            info: <Info className="size-[18px] text-blue-500" />,
            warning: <TriangleAlert className="size-[18px] text-amber-500" />,
            loading: null,
          }}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                'group w-full flex items-center justify-start gap-3 p-4 pr-10 rounded-xl border border-border/50 bg-card/95 backdrop-blur-md shadow-lg shadow-black/10 relative [&>[data-icon]]:flex-shrink-0 [&>[data-content]]:flex-1',
              title: 'text-sm font-medium text-foreground',
              description: 'text-xs text-muted-foreground mt-0.5',
              actionButton:
                'bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors',
              cancelButton:
                'bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors',
              closeButton:
                '!absolute !top-2 !right-2 !left-auto !bottom-auto !transform-none !bg-transparent !border-0 !shadow-none text-muted-foreground hover:text-foreground transition-colors !p-1 !rounded-md hover:!bg-muted/50',
              icon: 'flex-shrink-0 !mr-0',
            },
          }}
        />
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
                    <Route path="/vocabulary" element={<VocabularyPage />} />
                    <Route path="/vibes" element={<VibesPage />} />
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
    </ThemeProvider>
  )
}

export default App
