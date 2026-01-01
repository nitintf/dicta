import { cn } from '@/lib/cn'

import { settingsNavigation } from '../config/settings-navigation'
import { SettingsPanelId } from '../types/settings-navigation'

interface SettingsSidebarProps {
  activeSection: SettingsPanelId
  onSectionChange: (section: SettingsPanelId) => void
}

export function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <div className="w-[240px] border-r border-border shrink-0">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">
          SETTINGS
        </h2>

        <nav className="space-y-6">
          {settingsNavigation.map(group => (
            <div key={group.label} className="space-y-1">
              {group.label !== 'SETTINGS' && (
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                  {group.label}
                </h3>
              )}

              {group.sections.map(section => {
                const Icon = section.icon
                const isActive = activeSection === section.id

                return (
                  <button
                    key={section.id}
                    onClick={() =>
                      onSectionChange(section.id as SettingsPanelId)
                    }
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isActive && 'bg-accent text-accent-foreground font-medium'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{section.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
