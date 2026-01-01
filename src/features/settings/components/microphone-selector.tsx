import { Mic } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAudioDevices } from '@/hooks/use-audio-devices'

import { useSettingsStore } from '../store'

export function MicrophoneSelector() {
  const { devices } = useAudioDevices()
  const { settings, setMicrophoneDevice } = useSettingsStore()
  const selectedDeviceId = settings.voiceInput.microphoneDeviceId

  const handleSelectDevice = async (deviceId: string) => {
    await setMicrophoneDevice(deviceId === 'auto-detect' ? null : deviceId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mic className="h-4 w-4" />
          Change Microphone
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        <DropdownMenuRadioGroup
          value={selectedDeviceId || 'auto-detect'}
          onValueChange={handleSelectDevice}
        >
          {/* Auto-detect option */}
          <DropdownMenuRadioItem value="auto-detect">
            <div className="flex flex-col">
              <span>
                Auto-detect{' '}
                {devices.find(d => d.isDefault || d.isRecommended) && (
                  <span className="text-muted-foreground">
                    ({devices.find(d => d.isDefault || d.isRecommended)?.label})
                  </span>
                )}
              </span>
            </div>
          </DropdownMenuRadioItem>

          {/* Individual devices */}
          {devices.map(device => (
            <DropdownMenuRadioItem
              key={device.deviceId}
              value={device.deviceId}
            >
              <div className="flex flex-col">
                <span>
                  {device.label ||
                    `Microphone ${device.deviceId.substring(0, 8)}`}
                  {device.isRecommended && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (recommended)
                    </span>
                  )}
                </span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
