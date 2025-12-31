interface DictaLogoProps {
  className?: string
  size?: number
}

export function DictaLogo({ className, size = 24 }: DictaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Waveform bars - audio visualization style */}
      <rect
        x="4"
        y="10"
        width="2"
        height="4"
        rx="1"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="7"
        y="7"
        width="2"
        height="10"
        rx="1"
        fill="currentColor"
        opacity="0.7"
      />
      <rect x="10" y="4" width="2" height="16" rx="1" fill="currentColor" />
      <rect
        x="13"
        y="6"
        width="2"
        height="12"
        rx="1"
        fill="currentColor"
        opacity="0.8"
      />
      <rect
        x="16"
        y="8"
        width="2"
        height="8"
        rx="1"
        fill="currentColor"
        opacity="0.6"
      />
      <rect
        x="19"
        y="9"
        width="2"
        height="6"
        rx="1"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  )
}
