"use client"

interface HarGharLogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export function HarGharLogo({ size = 40, className = "", showText = true }: HarGharLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* Circular logo mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hg-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="0.5" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="hg-grad-light" x1="30" y1="30" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="hg-shadow" x="-4" y="-2" width="128" height="128">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7c3aed" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Circle background with gradient */}
        <circle cx="60" cy="60" r="58" fill="url(#hg-grad)" />
        {/* Subtle glass overlay */}
        <circle cx="60" cy="60" r="58" fill="url(#hg-grad-light)" />
        {/* Thin border ring */}
        <circle cx="60" cy="60" r="56" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" fill="none" />

        {/* House roof */}
        <path
          d="M60 24L28 50H36V50L60 30L84 50H92L60 24Z"
          fill="white"
          fillOpacity="0.95"
        />

        {/* House body with door */}
        <rect x="38" y="50" width="44" height="34" rx="3" fill="white" fillOpacity="0.95" />

        {/* Door */}
        <rect x="52" y="62" width="16" height="22" rx="2" fill="url(#hg-grad)" />
        {/* Door knob */}
        <circle cx="64" cy="74" r="2" fill="white" fillOpacity="0.8" />

        {/* Left window */}
        <rect x="42" y="56" width="8" height="8" rx="1.5" fill="url(#hg-grad)" fillOpacity="0.6" />
        {/* Right window */}
        <rect x="70" y="56" width="8" height="8" rx="1.5" fill="url(#hg-grad)" fillOpacity="0.6" />

        {/* H letter - left stroke */}
        <rect x="26" y="46" width="7" height="48" rx="3" fill="white" fillOpacity="0.95" />
        {/* H letter - right stroke */}
        <rect x="87" y="46" width="7" height="48" rx="3" fill="white" fillOpacity="0.95" />
        {/* H letter - horizontal bar */}
        <rect x="26" y="64" width="68" height="7" rx="3" fill="white" fillOpacity="0.95" />
      </svg>

      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className="text-[1.15em] font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            HarGhar
          </span>
          <span className="text-[0.45em] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            Home Services
          </span>
        </span>
      )}
    </span>
  )
}
