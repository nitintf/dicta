import { invoke } from '@tauri-apps/api/core'

import { validateStoreData } from '@/schemas/stores'

/**
 * Export all application data (settings, transcriptions, snippets, vocabulary, vibes)
 * as a zip file and trigger download
 */
export async function exportAllData(): Promise<void> {
  try {
    const zipData = (await invoke('export_all_data')) as number[]

    const uint8Array = new Uint8Array(zipData)

    const blob = new Blob([uint8Array], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dicta-backup-${new Date().toISOString().split('T')[0]}.zip`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to export data'
    )
  }
}

/**
 * Import all application data from a zip file
 */
export async function importAllData(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const zipData = Array.from(uint8Array)

    const result = (await invoke('import_all_data', { zipData })) as string
    return result
  } catch (error) {
    console.error('Import failed:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to import data'
    )
  }
}

/**
 * Import data from individual JSON files
 */
export async function importFromJson(file: File): Promise<string> {
  try {
    const fileName = file.name
    const jsonData = await file.text()

    // Parse and validate JSON
    const data = JSON.parse(jsonData)
    const validation = validateStoreData(fileName, data)

    if (!validation.success) {
      throw new Error(validation.error)
    }

    // Call Rust command to import single file
    const result = (await invoke('import_from_json', {
      fileName,
      jsonData,
    })) as string
    return result
  } catch (error) {
    console.error('Import from JSON failed:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to import JSON file'
    )
  }
}

/**
 * Determine if a file is a zip file
 */
export function isZipFile(file: File): boolean {
  return (
    file.name.endsWith('.zip') ||
    file.type === 'application/zip' ||
    file.type === 'application/x-zip-compressed'
  )
}

/**
 * Determine if a file is a JSON file
 */
export function isJsonFile(file: File): boolean {
  return file.name.endsWith('.json') || file.type === 'application/json'
}
