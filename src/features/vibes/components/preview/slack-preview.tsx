interface SlackPreviewProps {
  text: string
}

export function SlackPreview({ text }: SlackPreviewProps) {
  return (
    <div className="bg-background border border-border/50 rounded-lg p-3 min-h-[140px]">
      <div className="flex gap-2.5">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold">
          J
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[13px] font-semibold text-foreground">
              You
            </span>
            <span className="text-[11px] text-muted-foreground">now</span>
          </div>
          <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
            {text}
          </p>
        </div>
      </div>
    </div>
  )
}
