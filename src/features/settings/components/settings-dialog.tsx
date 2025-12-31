import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Customize your Dicta experience
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Settings configuration coming soon...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
