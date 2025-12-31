import { Palette } from 'lucide-react'

export function StylesPage() {
  return (
    <div className="h-full p-8 pt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Styles</h1>
        <p className="text-sm text-muted-foreground">
          Manage pre-defined style prompts for transcription
        </p>
      </div>

      <div className="space-y-4">
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-gray-200 bg-gray-50/30">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
            <Palette className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">
            No styles configured
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Create custom style prompts to format your transcriptions
          </p>
        </div>
      </div>
    </div>
  )
}
