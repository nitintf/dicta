import { useState, useRef } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  exportAllData,
  importAllData,
  importFromJson,
  isZipFile,
  isJsonFile,
} from '@/utils/data-export'

import { SettingsPanel, SettingItem, SettingsSection } from './settings-panel'
import { useSettingsStore } from '../../store'

export function PrivacyPanel() {
  const { settings, setAnalytics, setErrorLogging, resetSettings } =
    useSettingsStore()

  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [errorLoggingLoading, setErrorLoggingLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAnalyticsToggle = async (checked: boolean) => {
    setAnalyticsLoading(true)
    try {
      await setAnalytics(checked)
    } catch (error) {
      console.error('Failed to toggle analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleErrorLoggingToggle = async (checked: boolean) => {
    setErrorLoggingLoading(true)
    try {
      await setErrorLogging(checked)
    } catch (error) {
      console.error('Failed to toggle error logging:', error)
    } finally {
      setErrorLoggingLoading(false)
    }
  }

  const handleExport = async () => {
    setExportLoading(true)
    try {
      await exportAllData()
      toast.success(
        'All data exported successfully (settings, transcriptions, snippets, vocabulary, vibes)'
      )
    } catch (error) {
      toast.error('Failed to export data')
      console.error('Failed to export data:', error)
    } finally {
      setExportLoading(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportLoading(true)
    try {
      let result: string

      if (isZipFile(file)) {
        // Import from zip (all data)
        result = await importAllData(file)
        toast.success(result)
      } else if (isJsonFile(file)) {
        // Import from individual JSON file
        result = await importFromJson(file)
        toast.success(result)
      } else {
        toast.error('Invalid file type. Please select a .zip or .json file')
        return
      }

      // Reload the page to reflect imported data
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to import data'
      )
      console.error('Failed to import data:', error)
    } finally {
      setImportLoading(false)
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleReset = async () => {
    if (
      confirm(
        'Are you sure you want to reset all settings to defaults? This action cannot be undone.'
      )
    ) {
      try {
        await resetSettings()
        toast.success('Settings reset successfully')
      } catch (error) {
        toast.error('Failed to reset settings')
        console.error('Failed to reset settings:', error)
      }
    }
  }

  return (
    <SettingsPanel
      title="Privacy & Data"
      description="Control how your data is stored and used"
    >
      <SettingsSection title="Data Management">
        {/* TODO: Implement storage location functionality */}
        {/* <SettingItem
          title="Storage location"
          description="~/Documents/Dicta"
          action={
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleOpenStorageLocation}
            >
              <FolderOpen className="h-4 w-4" />
              Open
            </Button>
          }
        /> */}

        <SettingItem
          title="Export"
          description="Download all your data (settings, transcriptions, snippets, vocabulary, vibes) as a zip file"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? 'Exporting...' : 'Export'}
            </Button>
          }
        />

        <SettingItem
          title="Import"
          description="Restore all data from a zip file or individual JSON files"
          action={
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.json"
                onChange={handleImportFile}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportClick}
                disabled={importLoading}
              >
                {importLoading ? 'Importing...' : 'Import'}
              </Button>
            </>
          }
        />
      </SettingsSection>

      <SettingsSection title="Privacy">
        <SettingItem
          title="Analytics"
          description="Help improve Dicta by sharing anonymous usage data"
          action={
            <Switch
              checked={settings.privacy.analytics}
              onCheckedChange={handleAnalyticsToggle}
              disabled={analyticsLoading}
            />
          }
        />

        <SettingItem
          title="Error logging"
          description="Send error reports to help us fix issues"
          action={
            <Switch
              checked={settings.privacy.errorLogging}
              onCheckedChange={handleErrorLoggingToggle}
              disabled={errorLoggingLoading}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Danger Zone">
        <SettingItem
          title="Reset settings"
          description="Reset all settings to their default values"
          action={
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleReset}
            >
              Reset
            </Button>
          }
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
