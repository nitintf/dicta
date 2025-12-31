import { Keyboard, BookOpen, MessageCircle } from 'lucide-react'

export function HelpPage() {
  return (
    <div className="h-full p-8 pt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Help</h1>
        <p className="text-sm text-muted-foreground">
          Get help and learn how to use Dicta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        {/* Keyboard Shortcuts */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Keyboard Shortcuts
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Open Settings
              </span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-200 rounded">
                ⌘,
              </kbd>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Documentation
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Learn how to get the most out of Dicta with our comprehensive
            guides.
          </p>
        </div>

        {/* Support */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Support</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}
