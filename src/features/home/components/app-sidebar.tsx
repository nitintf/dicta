import { Home, FileText, Palette, HelpCircle, Settings } from 'lucide-react'
import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLocation, Link } from 'react-router-dom'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { SettingsDialog } from './settings-dialog'
import packageJson from '../../../../package.json'

const menuItems = [
  {
    title: 'Home',
    icon: Home,
    path: '/',
  },
  {
    title: 'Snippets',
    icon: FileText,
    path: '/snippets',
  },
  {
    title: 'Styles',
    icon: Palette,
    path: '/styles',
  },
]

export function AppSidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const location = useLocation()

  // Keyboard shortcut for settings: Cmd+,
  useHotkeys('mod+comma', () => setSettingsOpen(true), {
    preventDefault: true,
  })

  return (
    <>
      <Sidebar variant="sidebar" collapsible="offcanvas">
        <SidebarContent className="pt-12">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map(item => {
                  const isActive = location.pathname === item.path
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link
                          to={item.path}
                          className="flex items-center gap-3"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/help'}
                tooltip="Help"
              >
                <Link to="/help" className="flex items-center gap-3">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-3"
                tooltip="Settings (⌘,)"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  ⌘,
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="px-4 py-2 text-xs text-muted-foreground">
            v{packageJson.version}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
