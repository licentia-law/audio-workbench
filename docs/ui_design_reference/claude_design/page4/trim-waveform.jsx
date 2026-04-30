// Deterministic waveform — drawn from a seeded pseudo-random source
// so it looks like a real song but never changes between renders.
function genWaveform(N = 600, seed = 7) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const arr = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    // shape: intro quiet → builds → chorus loud → bridge dip → outro
    const env =
      0.25 +
      0.55 * Math.pow(Math.sin(t * Math.PI), 0.7) +
      0.18 * Math.sin(t * Math.PI * 6) +
      (t > 0.55 && t < 0.62 ? -0.25 : 0) +
      (t > 0.85 ? -0.15 * (t - 0.85) * 6 : 0);
    const noise = (rnd() - 0.5) * 0.55;
    const v = Math.max(0.05, Math.min(1, env + noise));
    arr.push(v);
  }
  return arr;
}

const WAVE = genWaveform(620, 13);

// Format seconds as M:SS or M:SS.dd
function fmt(t, withMs = false) {
  if (t == null || isNaN(t)) return '--:--';
  const sign = t < 0 ? '-' : '';
  t = Math.max(0, Math.abs(t));
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  const ss = Math.floor(s).toString().padStart(2, '0');
  if (!withMs) return `${sign}${m}:${ss}`;
  const ms = Math.floor((s - Math.floor(s)) * 100).toString().padStart(2, '0');
  return `${sign}${m}:${ss}.${ms}`;
}

// Renders the full-width waveform card with handles, selection, playhead, ruler
const WaveformCard = ({
  duration = 222,             // total seconds (3:42)
  startSec = 45.32,
  endSec   = 168.91,
  playSec  = 94.20,
  onChange = () => {},
  state    = 'uploaded',      // empty | uploaded | processing | success | error
  height   = 220,
}) => {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(960);
  const [drag, setDrag] = React.useState(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => setW(ref.current.clientWidth));
    ro.observe(ref.current);
    setW(ref.current.clientWidth);
    return () => ro.disconnect();
  }, []);

  const pxPerSec = w / duration;
  const sx = startSec * pxPerSec;
  const ex = endSec * pxPerSec;
  const px = playSec * pxPerSec;

  // Ruler ticks every 30s
  const ticks = [];
  for (let t = 0; t <= duration; t += 30) ticks.push(t);
  if (ticks[ticks.length-1] !== duration) ticks.push(duration);

  const startDrag = (which) => (e) => {
    e.preventDefault();
    setDrag(which);
    const rect = ref.current.getBoundingClientRect();
    const move = (ev) => {
      const x = Math.max(0, Math.min(rect.width, ev.clientX - rect.left));
      const sec = (x / rect.width) * duration;
      if (which === 'start') onChange({ startSec: Math.min(sec, endSec - 1) });
      else if (which === 'end') onChange({ endSec: Math.max(sec, startSec + 1) });
      else if (which === 'play') onChange({ playSec: sec });
    };
    const up = () => {
      setDrag(null);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const isEmpty = state === 'empty';

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card">
      {/* Ruler */}
      <div className="relative h-7 px-4 pt-2 border-b border-line2/40">
        <div ref={ref} className="relative h-5">
          {!isEmpty && ticks.map(t => {
            const left = (t / duration) * 100;
            return (
              <div key={t} className="absolute top-0 -translate-x-1/2 num text-[11px] text-fg-mute" style={{ left: `${left}%` }}>
                {fmt(t)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Waveform area */}
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 px-4">
          <div className="relative h-full w-full">
            {/* SVG waveform */}
            {!isEmpty && (
              <svg viewBox={`0 0 ${WAVE.length} 100`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="wfDim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3A4670"/><stop offset="1" stopColor="#222B47"/>
                  </linearGradient>
                  <linearGradient id="wfHot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7CF0E0"/><stop offset="1" stopColor="#2DBEAE"/>
                  </linearGradient>
                  <clipPath id="selClip">
                    <rect x={(startSec/duration)*WAVE.length} y="0"
                          width={((endSec-startSec)/duration)*WAVE.length} height="100"/>
                  </clipPath>
                </defs>
                {/* dim bars */}
                <g fill="url(#wfDim)">
                  {WAVE.map((v, i) => (
                    <rect key={i} x={i+0.15} y={50 - v*46} width={0.7} height={v*92} rx="0.3"/>
                  ))}
                </g>
                {/* hot bars (clipped to selection) */}
                <g fill="url(#wfHot)" clipPath="url(#selClip)">
                  {WAVE.map((v, i) => (
                    <rect key={i} x={i+0.15} y={50 - v*46} width={0.7} height={v*92} rx="0.3"/>
                  ))}
                </g>
                {/* center hairline */}
                <line x1="0" y1="50" x2={WAVE.length} y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4"/>
              </svg>
            )}

            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="stripe rounded-lg w-full h-full opacity-30"></div>
                <div className="absolute text-fg-mute text-sm">파일을 업로드하면 파형이 표시됩니다</div>
              </div>
            )}

            {state === 'processing' && (
              <div className="absolute inset-0 bg-ink-850/60 backdrop-blur-[1px] flex items-center justify-center rounded">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-1 w-64 bg-ink-500 rounded overflow-hidden">
                    <div className="h-full bg-brand-cyan animate-pulse" style={{width:'62%'}}></div>
                  </div>
                  <div className="text-fg-dim text-sm num">자르는 중… 62%</div>
                </div>
              </div>
            )}

            {/* Selection overlay tint */}
            {!isEmpty && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{
                  left: `${(startSec/duration)*100}%`,
                  width: `${((endSec-startSec)/duration)*100}%`,
                  background: 'linear-gradient(180deg, rgba(94,230,214,0.10), rgba(94,230,214,0.02))',
                  borderTop: '1px dashed rgba(94,230,214,0.45)',
                  borderBottom: '1px dashed rgba(94,230,214,0.45)',
                }}
              />
            )}

            {/* Start handle */}
            {!isEmpty && (
              <Handle
                side="start"
                xPct={(startSec/duration)*100}
                onMouseDown={startDrag('start')}
                label={fmt(startSec, true)}
                active={drag==='start'}
              />
            )}
            {/* End handle */}
            {!isEmpty && (
              <Handle
                side="end"
                xPct={(endSec/duration)*100}
                onMouseDown={startDrag('end')}
                label={fmt(endSec, true)}
                active={drag==='end'}
              />
            )}

            {/* Playhead */}
            {!isEmpty && (
              <div
                className="absolute top-0 bottom-0 pointer-events-auto"
                style={{ left: `${(playSec/duration)*100}%`, width: 1 }}
                onMouseDown={startDrag('play')}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-play"></div>
                <div className="absolute inset-y-0 -left-px w-[2px] bg-play"></div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-play/15 border border-play/40 text-play num text-[11px]">
                  {fmt(playSec, true)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-line2/40">
        <div className="flex items-center gap-1.5">
          <ToolBtn><Icon name="zoom-out" /></ToolBtn>
          <ToolBtn><Icon name="zoom-in" /></ToolBtn>
          <ToolBtn><Icon name="fit" /></ToolBtn>
          <span className="ml-2 text-[11px] text-fg-mute num">zoom 1.0×</span>
        </div>
        <div className="flex items-center gap-3 w-72">
          <Icon name="volume-low" className="w-4 h-4 text-fg-mute" />
          <div className="relative h-1.5 flex-1 bg-ink-500 rounded-full">
            <div className="absolute inset-y-0 left-0 w-3/4 bg-fg-dim rounded-full"></div>
            <div className="absolute -top-1 left-[75%] w-3.5 h-3.5 -translate-x-1/2 bg-fg rounded-full ring-2 ring-ink-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Handle = ({ side, xPct, onMouseDown, label, active }) => (
  <div
    className="absolute top-0 bottom-0 cursor-ew-resize group"
    style={{ left: `${xPct}%` }}
    onMouseDown={onMouseDown}
  >
    {/* Vertical line */}
    <div className="absolute inset-y-0 -left-px w-[2px] bg-brand-cyan/80"></div>
    {/* Grip pill */}
    <div className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-14 rounded-full border ${active ? 'bg-brand-cyan border-brand-cyan' : 'bg-ink-700 border-brand-cyan/70'} shadow-handle flex items-center justify-center`}>
      <div className="flex flex-col gap-0.5">
        <span className="block w-1.5 h-px bg-brand-cyan/80"></span>
        <span className="block w-1.5 h-px bg-brand-cyan/80"></span>
        <span className="block w-1.5 h-px bg-brand-cyan/80"></span>
      </div>
    </div>
    {/* Label */}
    <div className={`absolute -top-7 -translate-x-1/2 left-0 px-1.5 py-0.5 rounded num text-[11px] border ${side==='start' ? 'bg-brand-cyan/15 border-brand-cyan/50 text-brand-cyan' : 'bg-brand-indigo/15 border-brand-indigo/50 text-brand-indigo'}`}>
      {label}
    </div>
  </div>
);

const ToolBtn = ({ children, onClick }) => (
  <button onClick={onClick} className="w-8 h-8 grid place-items-center rounded-md border border-line2 text-fg-dim hover:text-fg hover:border-line2/80 hover:bg-ink-600">
    {children}
  </button>
);

window.WaveformCard = WaveformCard;
window.fmt = fmt;
