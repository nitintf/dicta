import { open as openUrl } from '@tauri-apps/plugin-shell'
import { Key, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { getProviderInfo } from '../provider-info'

import type { TranscriptionModel } from '../types'

interface ApiKeyModalProps {
  model: TranscriptionModel | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (apiKey: string) => Promise<void>
}

export function ApiKeyModal({
  model,
  open,
  onOpenChange,
  onSave,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!model) return null

  const providerInfo = getProviderInfo(model.provider)

  const handleSave = async () => {
    if (!apiKey.trim()) return

    setLoading(true)
    try {
      await onSave(apiKey)
      setApiKey('')
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save API key:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={providerInfo.color}>{providerInfo.icon}</div>
            Add API Key for {model.name}
          </DialogTitle>
          <DialogDescription>
            Enter your {providerInfo.name} API key to use this transcription
            model. Your key will be stored securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="pr-10"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    void handleSave()
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Key className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Get your API key from the{' '}
                <button
                  type="button"
                  onClick={() => void openUrl(getProviderUrl(model.provider))}
                  className="text-primary hover:underline cursor-pointer"
                >
                  {providerInfo.name} dashboard
                </button>
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setApiKey('')
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!apiKey.trim() || loading}>
            {loading ? 'Saving...' : 'Save API Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getProviderUrl(provider: string): string {
  const urls: Record<string, string> = {
    openai: 'https://platform.openai.com/api-keys',
    google: 'https://console.cloud.google.com/apis/credentials',
    deepgram: 'https://console.deepgram.com/api-keys',
    assemblyai: 'https://www.assemblyai.com/dashboard/api-keys',
    elevenlabs: 'https://elevenlabs.io/app/settings/api-keys',
  }
  return urls[provider] || '#'
}
