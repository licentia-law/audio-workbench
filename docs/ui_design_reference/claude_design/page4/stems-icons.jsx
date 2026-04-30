// Extra icons for the stems page (extends the trim icon set)
const StemIcon = ({ name, className = 'w-4 h-4', stroke = 1.6 }) => {
  const common = {
    width: '1em', height: '1em', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    className,
  };
  switch (name) {
    case 'mic': return (
      <svg {...common}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/></svg>
    );
    case 'drum': return (
      <svg {...common}><ellipse cx="12" cy="7" rx="8" ry="3"/><path d="M4 7v9c0 1.7 3.6 3 8 3s8-1.3 8-3V7"/><path d="M9 10v9M15 10v9"/></svg>
    );
    case 'bass': return (
      <svg {...common}><circle cx="9" cy="16" r="3.5"/><path d="M12 14V4l8 3-8 3"/></svg>
    );
    case 'other': return (
      <svg {...common}><path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>
    );
    case 'mute': return (
      <svg {...common}><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>
    );
    case 'solo': return (
      <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9 9h4a2 2 0 0 1 0 4H9v4M14 13l3 4"/></svg>
    );
    case 'wave-mini': return (
      <svg {...common}><path d="M2 12h2l1-4 2 8 2-12 2 16 2-8 2 4 2-2 2 4h2"/></svg>
    );
    case 'reset': return (
      <svg {...common}><path d="M4 12a8 8 0 1 0 2.5-5.8L4 9"/><path d="M4 4v5h5"/></svg>
    );
    case 'mix': return (
      <svg {...common}><path d="M4 6h6M14 6h6M4 12h6M14 12h6M4 18h6M14 18h6"/><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/></svg>
    );
    default: return null;
  }
};

window.StemIcon = StemIcon;
