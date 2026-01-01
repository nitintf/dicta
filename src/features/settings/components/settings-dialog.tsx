import React, { useState, useCallback, useEffect } from 'react'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useTauriEvent } from '@/hooks/use-tauri-event'

import { AboutPanel } from './panels/about-panel'
import { AdvancedPanel } from './panels/advanced-panel'
import { GeneralPanel } from './panels/general-panel'
import { ModelsPanel } from './panels/models-panel'
import { PrivacyPanel } from './panels/privacy-panel'
import { ShortcutsPanel } from './panels/shortcuts-panel'
import { TranscriptionPanel } from './panels/transcription-panel'
import { SettingsSidebar } from './settings-sidebar'
import { SettingsPanelId } from '../types/settings-navigation'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSection?: SettingsPanelId
}

interface OpenSettingsPayload {
  section?: SettingsPanelId
}

type PanelComponent =
  | React.ComponentType<{
      onNavigateToPanel: (section: SettingsPanelId) => void
    }>
  | React.ComponentType

const panelComponents: Record<SettingsPanelId, PanelComponent> = {
  general: GeneralPanel,
  shortcuts: ShortcutsPanel,
  transcription: TranscriptionPanel,
  models: ModelsPanel,
  privacy: PrivacyPanel,
  advanced: AdvancedPanel,
  about: AboutPanel,
}

export function SettingsDialog({
  open,
  onOpenChange,
  initialSection = 'general',
}: SettingsDialogProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsPanelId>(initialSection)

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  const handleOpenSettings = useCallback(
    (event: { payload: OpenSettingsPayload }) => {
      const section = event.payload.section || 'general'
      setActiveSection(section)
      onOpenChange(true)
    },
    [onOpenChange]
  )

  useTauriEvent<OpenSettingsPayload>('open-settings', handleOpenSettings, [
    handleOpenSettings,
  ])

  const ActivePanel = panelComponents[activeSection]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="min-w-[900px] max-w-[900px] max-h-[700px] min-h-[700px]"
        showCloseButton={false}
      >
        <div className="flex h-full w-full">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              <ActivePanel onNavigateToPanel={setActiveSection} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
