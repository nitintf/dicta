import { FileText } from 'lucide-react'

export function SnippetsPage() {
  return (
    <div className="h-full p-8 pt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Snippets</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage text replacement snippets
        </p>
      </div>

      <div className="space-y-4">
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-gray-200 bg-gray-50/30">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">
            No snippets created
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Create snippets to quickly replace words or phrases during
            transcription
          </p>
        </div>
      </div>
    </div>
  )
}
