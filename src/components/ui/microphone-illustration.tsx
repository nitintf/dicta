interface MicrophoneIllustrationProps {
  className?: string
}

export function MicrophoneIllustration({
  className,
}: MicrophoneIllustrationProps) {
  return (
    <svg
      viewBox="0 0 300 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Small subtle wave patterns scattered throughout */}
      <g opacity="0.03">
        {/* Wave pattern 1 - top right */}
        <path
          d="M 180 60 Q 190 55 200 60 Q 210 65 220 60 Q 230 55 240 60"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 180 70 Q 190 65 200 70 Q 210 75 220 70 Q 230 65 240 70"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Wave pattern 2 - middle left */}
        <path
          d="M 30 200 Q 40 195 50 200 Q 60 205 70 200"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 30 210 Q 40 205 50 210 Q 60 215 70 210"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Wave pattern 3 - middle right */}
        <path
          d="M 220 280 Q 235 275 250 280 Q 265 285 280 280"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Wave pattern 4 - bottom left */}
        <path
          d="M 40 450 Q 50 445 60 450 Q 70 455 80 450 Q 90 445 100 450"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 40 460 Q 50 455 60 460 Q 70 465 80 460 Q 90 455 100 460"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Wave pattern 5 - top left */}
        <path
          d="M 50 120 Q 60 115 70 120 Q 80 125 90 120"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Wave pattern 6 - bottom right */}
        <path
          d="M 200 520 Q 215 515 230 520 Q 245 525 260 520"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Small circles as accents */}
        <circle cx="150" cy="180" r="3" fill="currentColor" />
        <circle cx="100" cy="340" r="2.5" fill="currentColor" />
        <circle cx="240" cy="400" r="2" fill="currentColor" />
        <circle cx="80" cy="90" r="2.5" fill="currentColor" />
        <circle cx="200" cy="160" r="2" fill="currentColor" />
      </g>
    </svg>
  )
}
