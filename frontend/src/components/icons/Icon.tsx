export type IconName =
  | 'logo'
  | 'scissors'
  | 'analyze'
  | 'key'
  | 'volume'
  | 'stems'
  | 'upload'
  | 'file'
  | 'trash'
  | 'check'
  | 'circle-check'
  | 'info'
  | 'warn'
  | 'error'
  | 'play'
  | 'pause'
  | 'stop'
  | 'skip-start'
  | 'skip-end'
  | 'download'
  | 'zoom-in'
  | 'zoom-out'
  | 'fit'
  | 'help'
  | 'cog'
  | 'support'
  | 'volume-low'
  | 'speaker'
  | 'dots'
  | 'metronome'
  | 'gauge'
  | 'list'
  | 'sparkle'
  | 'shield'
  | 'meter'
  | 'wave'

interface IconProps {
  name: IconName
  className?: string
  stroke?: number
}

export function Icon({ name, className = 'w-4 h-4', stroke = 1.6 }: IconProps) {
  const common = {
    width: '1em',
    height: '1em',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }
  switch (name) {
    case 'logo':
      return (
        <svg {...common}>
          <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2M21 12h.01" />
        </svg>
      )
    case 'scissors':
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
        </svg>
      )
    case 'analyze':
      return (
        <svg {...common}>
          <path d="M3 12h3l3-7 4 14 3-9 2 5h3" />
        </svg>
      )
    case 'key':
      return (
        <svg {...common}>
          <circle cx="9" cy="14" r="3.5" />
          <path d="m11.5 11.5 8-8M16 7l3 3M14 9l3 3" />
        </svg>
      )
    case 'volume':
      return (
        <svg {...common}>
          <path d="M11 5 6 9H3v6h3l5 4z" />
          <path d="M16 9a4 4 0 0 1 0 6" />
          <path d="M19 6a8 8 0 0 1 0 12" />
        </svg>
      )
    case 'stems':
      return (
        <svg {...common}>
          <path d="M4 6h16M4 10h10M4 14h16M4 18h7" />
        </svg>
      )
    case 'upload':
      return (
        <svg {...common}>
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M5 18h14M5 21h14" />
        </svg>
      )
    case 'file':
      return (
        <svg {...common}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
        </svg>
      )
    case 'trash':
      return (
        <svg {...common}>
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path d="m4 12 5 5 11-11" />
        </svg>
      )
    case 'circle-check':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      )
    case 'info':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6M12 7.5v.01" />
        </svg>
      )
    case 'warn':
      return (
        <svg {...common}>
          <path d="M12 3 2 21h20z" />
          <path d="M12 10v5M12 18v.01" />
        </svg>
      )
    case 'error':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </svg>
      )
    case 'play':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M7 5v14l12-7z" />
        </svg>
      )
    case 'pause':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      )
    case 'stop':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <rect x="6" y="6" width="12" height="12" rx="1.5" />
        </svg>
      )
    case 'skip-start':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <rect x="5" y="5" width="2" height="14" rx="1" />
          <path d="M20 5v14L9 12z" />
        </svg>
      )
    case 'skip-end':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <rect x="17" y="5" width="2" height="14" rx="1" />
          <path d="M4 5v14l11-7z" />
        </svg>
      )
    case 'download':
      return (
        <svg {...common}>
          <path d="M12 4v12M7 11l5 5 5-5" />
          <path d="M5 20h14" />
        </svg>
      )
    case 'zoom-in':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6" />
          <path d="M21 21l-5-5M11 8v6M8 11h6" />
        </svg>
      )
    case 'zoom-out':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6" />
          <path d="M21 21l-5-5M8 11h6" />
        </svg>
      )
    case 'fit':
      return (
        <svg {...common}>
          <path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" />
        </svg>
      )
    case 'help':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8M12 16.5v.01" />
        </svg>
      )
    case 'cog':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      )
    case 'support':
      return (
        <svg {...common}>
          <path d="M4 13a8 8 0 0 1 16 0v4a3 3 0 0 1-3 3h-1v-7h4M4 17v-4h4v7H7a3 3 0 0 1-3-3z" />
        </svg>
      )
    case 'volume-low':
      return (
        <svg {...common}>
          <path d="M11 5 6 9H3v6h3l5 4z" />
          <path d="M16 10a3 3 0 0 1 0 4" />
        </svg>
      )
    case 'speaker':
      return (
        <svg {...common}>
          <path d="M11 5 6 9H3v6h3l5 4z" />
        </svg>
      )
    case 'dots':
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="1.2" fill="currentColor" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
          <circle cx="18" cy="12" r="1.2" fill="currentColor" />
        </svg>
      )
    case 'metronome':
      return (
        <svg {...common}>
          <path d="M8 3h8l3 18H5z" />
          <path d="M12 21V8M12 8l5-3" />
        </svg>
      )
    case 'gauge':
      return (
        <svg {...common}>
          <path d="M4 18a8 8 0 1 1 16 0" />
          <path d="M12 18 16 9" />
          <circle cx="12" cy="18" r="1.2" fill="currentColor" />
        </svg>
      )
    case 'list':
      return (
        <svg {...common}>
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg {...common}>
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    case 'meter':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="2.5" height="12" rx="1" />
          <rect x="7.5" y="9" width="2.5" height="9" rx="1" />
          <rect x="12" y="4" width="2.5" height="14" rx="1" />
          <rect x="16.5" y="7" width="2.5" height="11" rx="1" />
        </svg>
      )
    case 'wave':
      return (
        <svg {...common}>
          <path d="M3 12c1-4 2-6 3-6s2 4 3 6 2 6 3 6 2-4 3-6 2-4 3-4" />
        </svg>
      )
    default:
      return null
  }
}
