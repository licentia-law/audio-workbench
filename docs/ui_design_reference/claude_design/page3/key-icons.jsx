// Minimal stroked SVG icon set for Key page (extends trim-icons set)
const Icon = ({ name, className = 'w-4 h-4', stroke = 1.6 }) => {
  const common = {
    width: '1em', height: '1em', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    className,
  };
  switch (name) {
    case 'logo': return (
      <svg {...common}><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2M21 12h.01"/></svg>
    );
    case 'scissors': return (
      <svg {...common}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg>
    );
    case 'analyze': return (
      <svg {...common}><path d="M3 12h3l3-7 4 14 3-9 2 5h3"/></svg>
    );
    case 'key': return (
      <svg {...common}><circle cx="9" cy="14" r="3.5"/><path d="m11.5 11.5 8-8M16 7l3 3M14 9l3 3"/></svg>
    );
    case 'volume': return (
      <svg {...common}><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M19 6a8 8 0 0 1 0 12"/></svg>
    );
    case 'stems': return (
      <svg {...common}><path d="M4 6h16M4 10h10M4 14h16M4 18h7"/></svg>
    );
    case 'upload': return (
      <svg {...common}><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 18h14M5 21h14"/></svg>
    );
    case 'cloud-up': return (
      <svg {...common}><path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 7"/><path d="M12 12v7M9 15l3-3 3 3"/></svg>
    );
    case 'trash': return (
      <svg {...common}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
    );
    case 'check': return (
      <svg {...common}><path d="m4 12 5 5 11-11"/></svg>
    );
    case 'circle-check': return (
      <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>
    );
    case 'info': return (
      <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>
    );
    case 'warn': return (
      <svg {...common}><path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18v.01"/></svg>
    );
    case 'error': return (
      <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>
    );
    case 'play': return (
      <svg {...common} fill="currentColor" stroke="none"><path d="M7 5v14l12-7z"/></svg>
    );
    case 'pause': return (
      <svg {...common} fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
    );
    case 'reset': return (
      <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
    );
    case 'arrow-right': return (
      <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    );
    case 'minus': return (
      <svg {...common}><path d="M5 12h14"/></svg>
    );
    case 'plus': return (
      <svg {...common}><path d="M12 5v14M5 12h14"/></svg>
    );
    case 'download': return (
      <svg {...common}><path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/></svg>
    );
    case 'sparkle': return (
      <svg {...common}><path d="M12 4v6M12 14v6M4 12h6M14 12h6"/></svg>
    );
    case 'music': return (
      <svg {...common}><path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>
    );
    case 'help': return (
      <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8M12 16.5v.01"/></svg>
    );
    case 'cog': return (
      <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
    );
    case 'support': return (
      <svg {...common}><path d="M4 13a8 8 0 0 1 16 0v4a3 3 0 0 1-3 3h-1v-7h4M4 17v-4h4v7H7a3 3 0 0 1-3-3z"/></svg>
    );
    case 'speaker': return (
      <svg {...common}><path d="M11 5 6 9H3v6h3l5 4z"/></svg>
    );
    case 'dots': return (
      <svg {...common}><circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/></svg>
    );
    case 'wave': return (
      <svg {...common}><path d="M3 12h2M7 9v6M11 6v12M15 8v8M19 11v2M21 12h.01"/></svg>
    );
    default: return null;
  }
};
window.Icon = Icon;
