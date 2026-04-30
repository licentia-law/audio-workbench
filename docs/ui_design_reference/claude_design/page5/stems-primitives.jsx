// Re-uses Badge / ActionBtn definitions on the stems page (kept local to avoid load order issues)
const Badge = ({ tone = 'ok', children }) => {
  const tones = {
    ok:    'bg-ok/12 text-ok border-ok/30',
    warn:  'bg-warn/12 text-warn border-warn/30',
    err:   'bg-err/12 text-err border-err/30',
    cyan:  'bg-brand-cyan/12 text-brand-cyan border-brand-cyan/30',
    mute:  'bg-ink-600 text-fg-mute border-line2',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 h-[22px] rounded-md border text-[11.5px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
};
window.Badge = Badge;
