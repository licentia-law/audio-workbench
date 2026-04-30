// 4-channel stem mixer
// Each channel: header (icon, name, badge) + mini waveform + transport + vertical fader with level meter + mute/solo + download

// deterministic mini waveform per stem
function genStemWave(seed, N = 220) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const arr = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const env = 0.3 + 0.55 * Math.pow(Math.sin(t * Math.PI * 1.4), 0.7) + 0.2 * Math.sin(t * Math.PI * 5 + s);
    const noise = (rnd() - 0.5) * 0.5;
    arr.push(Math.max(0.06, Math.min(1, env + noise)));
  }
  return arr;
}

const STEMS = [
  { id: 'vocals', label: '보컬',  tag: 'VOCALS', icon: 'mic',   color: '#A78BFA', glow: 'rgba(167,139,250,0.18)' },
  { id: 'drums',  label: '드럼',  tag: 'DRUMS',  icon: 'drum',  color: '#5EE6D6', glow: 'rgba(94,230,214,0.18)' },
  { id: 'bass',   label: '베이스', tag: 'BASS',  icon: 'bass',  color: '#7C8CFF', glow: 'rgba(124,140,255,0.18)' },
  { id: 'other',  label: '그 외', tag: 'OTHER',  icon: 'other', color: '#F2B544', glow: 'rgba(242,181,68,0.18)' },
];

// vertical fader with peak meter
const VerticalFader = ({ value, onChange, color, muted, playing }) => {
  // value is dB in range [-24, +12]; map to 0..1 (top=+12)
  const min = -24, max = 12;
  const ratio = (value - min) / (max - min); // 0..1, top is high
  const trackRef = React.useRef(null);

  const startDrag = (e) => {
    e.preventDefault();
    const rect = trackRef.current.getBoundingClientRect();
    const move = (ev) => {
      const y = Math.max(0, Math.min(rect.height, ev.clientY - rect.top));
      const r = 1 - y / rect.height;
      onChange(min + r * (max - min));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    move(e);
  };

  // simulated meter level (for visual)
  const meterPct = muted ? 0 : Math.max(0.1, Math.min(1, ratio * 0.95 + (playing ? 0.05 : 0)));

  return (
    <div className="flex items-stretch gap-3 h-[180px]">
      {/* Track */}
      <div ref={trackRef} className="relative w-9 select-none cursor-pointer" onMouseDown={startDrag}>
        {/* track bg */}
        <div className="absolute inset-x-[14px] inset-y-1 rounded-full bg-ink-800 border border-line2/50"></div>
        {/* fill */}
        <div
          className="absolute inset-x-[14px] rounded-full"
          style={{
            bottom: '4px',
            height: `calc(${ratio * 100}% - 8px)`,
            background: muted
              ? 'linear-gradient(180deg, #4A5377, #2C3656)'
              : `linear-gradient(180deg, ${color}, ${color}88)`,
            boxShadow: muted ? 'none' : `0 0 12px ${color}55`,
          }}
        />
        {/* tick marks at 0 dB */}
        <div
          className="absolute inset-x-[6px] h-px bg-fg-mute/40"
          style={{ top: `${(1 - (0 - min)/(max - min)) * 100}%` }}
        />
        {/* knob */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-7 h-4 rounded-md border shadow-handle"
          style={{
            top: `calc(${(1 - ratio) * 100}% - 8px)`,
            background: '#E6ECFF',
            borderColor: color,
            boxShadow: `0 0 0 1px ${color}66, 0 6px 12px -4px rgba(0,0,0,0.6)`,
          }}>
          <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-px bg-ink-700"></div>
        </div>
      </div>

      {/* Scale + Meter */}
      <div className="flex items-stretch gap-2 flex-1">
        {/* Scale labels */}
        <div className="flex flex-col justify-between text-[10px] num text-fg-mute py-1">
          {['+12', '0', '-12', '-24', '-∞'].map(t => <span key={t}>{t}</span>)}
        </div>
        {/* Peak meter */}
        <div className="relative w-3 self-stretch rounded-sm bg-ink-800 border border-line2/50 overflow-hidden">
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: `${meterPct * 100}%`,
              background: `linear-gradient(180deg, ${meterPct > 0.85 ? '#F46E7A' : meterPct > 0.65 ? '#F2B544' : color} 0%, ${color}99 100%)`,
              transition: 'height 120ms linear',
            }}
          />
          {/* tick lines */}
          {[0.25, 0.5, 0.75].map((p,i) => (
            <div key={i} className="absolute inset-x-0 h-px bg-fg-faint/30" style={{ top: `${p*100}%` }}/>
          ))}
        </div>
      </div>
    </div>
  );
};

const StemMiniWave = ({ peaks, color, playing, muted, progress = 0.32 }) => (
  <svg viewBox={`0 0 ${peaks.length} 100`} preserveAspectRatio="none" className="w-full h-[64px]">
    <defs>
      <linearGradient id={`g-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity="0.95"/>
        <stop offset="1" stopColor={color} stopOpacity="0.5"/>
      </linearGradient>
      <clipPath id={`cp-${color.slice(1)}`}>
        <rect x="0" y="0" width={peaks.length * progress} height="100"/>
      </clipPath>
    </defs>
    {/* dim background */}
    <g fill="#3A4670" opacity={muted ? 0.35 : 0.55}>
      {peaks.map((v,i) => <rect key={i} x={i+0.15} y={50 - v*45} width={0.7} height={v*90} rx="0.3"/>)}
    </g>
    {/* hot played part */}
    {!muted && (
      <g fill={`url(#g-${color.slice(1)})`} clipPath={`url(#cp-${color.slice(1)})`}>
        {peaks.map((v,i) => <rect key={i} x={i+0.15} y={50 - v*45} width={0.7} height={v*90} rx="0.3"/>)}
      </g>
    )}
    {/* center hairline */}
    <line x1="0" y1="50" x2={peaks.length} y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4"/>
    {/* playhead */}
    {playing && !muted && (
      <line x1={peaks.length * progress} y1="0" x2={peaks.length * progress} y2="100" stroke="#FFB347" strokeWidth="0.6"/>
    )}
  </svg>
);

const StemChannel = ({ stem, value, onChange, muted, solo, onMute, onSolo, playing, onTogglePlay, fileBase }) => {
  const peaks = React.useMemo(() => genStemWave(stem.id.charCodeAt(0) * 7 + 11), [stem.id]);
  const dbLabel = value === -Infinity || value < -23.9 ? '-∞' : `${value >= 0 ? '+' : ''}${value.toFixed(1)} dB`;

  return (
    <div className={`rounded-2xl border bg-ink-700 shadow-card p-4 flex flex-col ${solo ? 'border-brand-cyan/60' : 'border-line'}`}>
      {/* header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: stem.glow, color: stem.color }}>
            <StemIcon name={stem.icon} className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight">{stem.label}</div>
            <div className="text-[10px] num tracking-[0.18em] font-semibold" style={{ color: stem.color }}>{stem.tag}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMute}
            title="뮤트"
            className={`w-7 h-7 grid place-items-center rounded-md border text-[10px] font-bold ${muted ? 'bg-err/15 border-err/50 text-err' : 'border-line2 text-fg-mute hover:text-fg hover:bg-ink-600'}`}>
            M
          </button>
          <button
            onClick={onSolo}
            title="솔로"
            className={`w-7 h-7 grid place-items-center rounded-md border text-[10px] font-bold ${solo ? 'bg-brand-cyan/15 border-brand-cyan/50 text-brand-cyan' : 'border-line2 text-fg-mute hover:text-fg hover:bg-ink-600'}`}>
            S
          </button>
        </div>
      </div>

      {/* mini waveform + play */}
      <div className="rounded-lg bg-ink-800 border border-line2/40 p-3">
        <StemMiniWave peaks={peaks} color={stem.color} playing={playing} muted={muted}/>
        <div className="flex items-center justify-between mt-1.5">
          <button
            onClick={onTogglePlay}
            className="w-7 h-7 grid place-items-center rounded-full text-ink-900 hover:opacity-90"
            style={{ background: stem.color }}>
            <Icon name={playing ? 'pause' : 'play'} className="w-3 h-3" />
          </button>
          <div className="num text-[11px] text-fg-mute">{playing ? '01:14' : '00:00'} / 03:42</div>
        </div>
      </div>

      {/* Volume header */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <div className="text-[12px] text-fg-dim">음량</div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onChange(0)}
            title="0 dB로 초기화"
            className="w-6 h-6 grid place-items-center rounded text-fg-mute hover:text-fg hover:bg-ink-600">
            <StemIcon name="reset" className="w-3.5 h-3.5"/>
          </button>
          <div className="num text-[12px] px-2 h-6 rounded border border-line2 bg-ink-800 text-fg flex items-center" style={{ minWidth: 64, justifyContent: 'center' }}>
            {dbLabel}
          </div>
        </div>
      </div>

      {/* Fader */}
      <VerticalFader value={value} onChange={onChange} color={stem.color} muted={muted} playing={playing}/>

      {/* Download */}
      <button className="mt-4 h-10 rounded-lg border border-line2 hover:border-brand-cyan/60 hover:bg-brand-cyan/5 group inline-flex items-center justify-center gap-2 text-[13px]">
        <Icon name="download" className="w-4 h-4 text-brand-cyan" />
        <span className="text-fg">다운로드</span>
      </button>
      <div className="num text-[11px] text-fg-mute text-center mt-1.5">{fileBase}({stem.id}).mp3</div>
    </div>
  );
};

window.STEMS = STEMS;
window.StemChannel = StemChannel;
window.VerticalFader = VerticalFader;
window.StemMiniWave = StemMiniWave;
window.genStemWave = genStemWave;
