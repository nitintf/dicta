import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import { AppSidebar } from './app-sidebar'

import type { ReactNode } from 'react'

interface HomeLayoutProps {
  children: ReactNode
}

export function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white">
        {/* Drag region for Tauri - full width */}
        <div
          data-tauri-drag-region
          className="fixed left-0 right-0 top-0 h-12 z-40"
        />

        {/* Sidebar toggle button near macOS window controls */}
        <div className="fixed left-20 top-0 z-50 flex items-center h-12">
          <SidebarTrigger className="pointer-events-auto" />
        </div>

        <AppSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          <div className="h-full">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
