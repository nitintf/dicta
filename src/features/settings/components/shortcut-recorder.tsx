import { useShortcutRecorder } from 'use-shortcut-recorder'

interface ShortcutRecorderProps {
  value: string
  onChange: (shortcut: string) => Promise<void>
  placeholder?: string
  disabled?: boolean
}

export function ShortcutRecorder({
  value,
  onChange,
  placeholder = 'Click to record shortcut',
  disabled = false,
}: ShortcutRecorderProps) {
  const {
    shortcut,
    savedShortcut,
    isRecording,
    error,
    startRecording,
    stopRecording,
  } = useShortcutRecorder({
    onChange: newShortcut => {
      // Convert array to string format (e.g., ['Control', 'KeyA'] -> 'CmdOrCtrl+A')
      const shortcutString = newShortcut
        .map(key => {
          if (key === 'Control' || key === 'Meta') return 'CmdOrCtrl'
          if (key.startsWith('Key')) return key.replace('Key', '')
          return key
        })
        .join('+')
      onChange(shortcutString)
    },
    excludedShortcuts: [
      ['Control', 'KeyC'],
      ['Control', 'KeyV'],
      ['Control', 'KeyX'],
      ['Control', 'KeyZ'],
      ['Control', 'KeyA'],
      ['Meta', 'KeyC'],
      ['Meta', 'KeyV'],
      ['Meta', 'KeyX'],
      ['Meta', 'KeyZ'],
      ['Meta', 'KeyA'],
    ],
    maxModKeys: 3,
    minModKeys: 1,
  })

  const displayShortcut = isRecording
    ? shortcut.join(' + ')
    : savedShortcut.length > 0
      ? savedShortcut.join(' + ')
      : value
          .replace(
            'CmdOrCtrl',
            navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'
          )
          .replace(/\+/g, ' + ')

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        className="shortcut-input flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={isRecording ? 'Press keys...' : placeholder}
        onFocus={disabled ? undefined : startRecording}
        onClick={disabled ? undefined : startRecording}
        onBlur={disabled ? undefined : () => stopRecording()}
        value={displayShortcut}
        readOnly={true}
        disabled={disabled}
      />

      {error && !disabled && (
        <div className="text-sm text-destructive">{error.message}</div>
      )}

      {!isRecording && !error && !disabled && (
        <p className="text-sm text-muted-foreground">
          Click to record a new shortcut
        </p>
      )}
    </div>
  )
}
