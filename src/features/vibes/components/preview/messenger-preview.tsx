interface MessengerPreviewProps {
  text: string
}

export function MessengerPreview({ text }: MessengerPreviewProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 rounded-xl p-3 min-h-[140px] flex items-end">
      <div className="bg-primary text-primary-foreground rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[90%] shadow-sm">
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      </div>
    </div>
  )
}
