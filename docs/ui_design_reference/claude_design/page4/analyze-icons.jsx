// Minimal stroked SVG icon set — no emoji, no decorative graphics
const Icon = ({ name, className = 'w-4 h-4', stroke = 1.6 }) => {
  const common = {
    width: '1em', height: '1em', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    className,
  };
  switch (name) {
    case 'logo': return (
      <svg {...common} viewBox="0 0 24 24"><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2M21 12h.01"/></svg>
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
    case 'trash': return (
      <svg {...common}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
    );
    case 'check': return (<svg {...common}><path d="m4 12 5 5 11-11"/></svg>);
    case 'circle-check': return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>);
    case 'info': return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>);
    case 'warn': return (<svg {...common}><path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18v.01"/></svg>);
    case 'error': return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>);
    case 'play': return (<svg {...common} fill="currentColor" stroke="none"><path d="M7 5v14l12-7z"/></svg>);
    case 'pause': return (<svg {...common} fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>);
    case 'stop': return (<svg {...common} fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>);
    case 'help': return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8M12 16.5v.01"/></svg>);
    case 'cog': return (<svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>);
    case 'support': return (<svg {...common}><path d="M4 13a8 8 0 0 1 16 0v4a3 3 0 0 1-3 3h-1v-7h4M4 17v-4h4v7H7a3 3 0 0 1-3-3z"/></svg>);
    case 'dots': return (<svg {...common}><circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/></svg>);
    case 'metronome': return (<svg {...common}><path d="M8 3h8l3 18H5z"/><path d="M12 21V8M12 8l5-3"/></svg>);
    case 'wave': return (<svg {...common}><path d="M3 12c2 0 2-5 4-5s2 10 4 10 2-7 4-7 2 4 4 4 2-2 2-2"/></svg>);
    case 'gauge': return (<svg {...common}><path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18 16 9"/><circle cx="12" cy="18" r="1.2" fill="currentColor"/></svg>);
    case 'refresh': return (<svg {...common}><path d="M4 4v6h6"/><path d="M20 20v-6h-6"/><path d="M5 14a8 8 0 0 0 14 3M19 10a8 8 0 0 0-14-3"/></svg>);
    case 'spark': return (<svg {...common}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2"/></svg>);
    case 'list': return (<svg {...common}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>);
    default: return null;
  }
};

window.Icon = Icon;
