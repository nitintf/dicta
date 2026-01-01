import { FileText } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg bg-gray-50/30">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-3">
        <FileText className="w-5 h-5 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">
        No transcriptions yet
      </h3>
      <p className="text-xs text-muted-foreground text-center max-w-sm">
        Press the global shortcut to start your first transcription
      </p>
    </div>
  )
}
