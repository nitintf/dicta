interface DefaultPreviewProps {
  text: string
}

export function DefaultPreview({ text }: DefaultPreviewProps) {
  return (
    <div className="bg-muted/40 rounded-lg p-3.5 min-h-[140px] flex items-center">
      <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
        {text}
      </p>
    </div>
  )
}
