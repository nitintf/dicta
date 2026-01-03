interface EmailPreviewProps {
  text: string
}

export function EmailPreview({ text }: EmailPreviewProps) {
  return (
    <div className="bg-background border border-border/50 rounded-lg p-3 min-h-[140px]">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-semibold">
            J
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-foreground truncate">
              you@email.com
            </p>
          </div>
        </div>
        <div className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </div>
      </div>
    </div>
  )
}
