interface AppAvatarGroupProps {
  icons: string[]
}

export function AppAvatarGroup({ icons }: AppAvatarGroupProps) {
  return (
    <div className="flex -space-x-3">
      {icons.map((icon, i) => (
        <div
          key={i}
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-background border-4 border-background shadow-sm ring-1 ring-border/10"
          style={{ zIndex: icons.length - i }}
        >
          <div className="w-full h-full rounded-full bg-muted/50 flex items-center justify-center">
            <img src={icon} alt="" className="w-7 h-7 object-contain" />
          </div>
        </div>
      ))}
    </div>
  )
}
