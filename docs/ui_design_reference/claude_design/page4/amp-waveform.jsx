// Deterministic waveform for amp page (stereo, blue tones)
function genAmpWave(N = 600, seed = 42) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const arr = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const env =
      0.30 +
      0.50 * Math.pow(Math.sin(t * Math.PI), 0.6) +
      0.18 * Math.sin(t * Math.PI * 8) +
      (t > 0.55 && t < 0.62 ? -0.20 : 0) +
      (t > 0.88 ? -0.30 * (t - 0.88) * 6 : 0);
    const noise = (rnd() - 0.5) * 0.55;
    const v = Math.max(0.04, Math.min(1, env + noise));
    arr.push(v);
  }
  return arr;
}
const AMPWAVE = genAmpWave(640, 23);

function fmt(t, withMs = false) {
  if (t == null || isNaN(t)) return '--:--';
  t = Math.max(0, t);
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  const ss = Math.floor(s).toString().padStart(2, '0');
  if (!withMs) return `${m}:${ss}`;
  const ms = Math.floor((s - Math.floor(s)) * 100).toString().padStart(2, '0');
  return `${m}:${ss}.${ms}`;
}

// Waveform card with dB grid on right + transport at bottom
const AmpWaveformCard = ({
  duration = 222,
  playSec = 94.20,
  gainDb = 0,
  state = 'uploaded',
  onSeek = () => {},
  height = 240,
}) => {
  const [w, setW] = React.useState(960);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => setW(ref.current.clientWidth));
    ro.observe(ref.current);
    setW(ref.current.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Ruler ticks every 30s
  const ticks = [];
  for (let t = 0; t <= duration; t += 30) ticks.push(t);
  if (ticks[ticks.length - 1] !== duration) ticks.push(duration);

  const dbLabels = [0, -6, -12, -18, -24];
  const isEmpty = state === 'empty';

  // Visual amplification factor (scale)
  const ampScale = Math.min(2.2, Math.pow(10, gainDb / 20));
  const willClip = ampScale * 0.95 > 1.0;

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card overflow-hidden">
      {/* Ruler */}
      <div className="relative h-7 px-4 pt-2 border-b border-line2/40 grid" style={{ gridTemplateColumns: '1fr 56px' }}>
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
        <div></div>
      </div>

      {/* Waveform area */}
      <div className="relative grid" style={{ gridTemplateColumns: '1fr 56px', height }}>
        {/* Left: waveform */}
        <div className="relative px-4 py-3">
          <div className="relative h-full w-full">
            {!isEmpty && (
              <svg viewBox={`0 0 ${AMPWAVE.length} 100`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="ampDim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3A4670"/><stop offset="1" stopColor="#222B47"/>
                  </linearGradient>
                  <linearGradient id="ampHot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7CDFF0"/>
                    <stop offset="0.5" stopColor="#5AC4E8"/>
                    <stop offset="1" stopColor="#3A8FD1"/>
                  </linearGradient>
                  <linearGradient id="ampClip" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#F46E7A"/><stop offset="1" stopColor="#C84252"/>
                  </linearGradient>
                </defs>
                {/* horizontal grid */}
                {dbLabels.map((db, i) => {
                  const y = 50 - (db === 0 ? 46 : (db / -24) * 46);
                  return <line key={'g'+i} x1="0" y1={y} x2={AMPWAVE.length} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3"/>;
                })}
                {dbLabels.map((db, i) => {
                  const y = 50 + (db === 0 ? 46 : (db / -24) * 46);
                  return <line key={'g2'+i} x1="0" y1={y} x2={AMPWAVE.length} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3"/>;
                })}
                {/* dim baseline (always shows full original) */}
                <g fill="url(#ampDim)" opacity="0.55">
                  {AMPWAVE.map((v, i) => (
                    <rect key={i} x={i * (AMPWAVE.length / AMPWAVE.length) + 0.15} y={50 - v * 46} width={0.7} height={v * 92} rx="0.3"/>
                  ))}
                </g>
                {/* amplified bars */}
                <g>
                  {AMPWAVE.map((v, i) => {
                    const scaled = Math.min(1, v * ampScale);
                    const clipped = v * ampScale > 1;
                    const fill = clipped ? 'url(#ampClip)' : 'url(#ampHot)';
                    return <rect key={'h'+i} x={i + 0.15} y={50 - scaled * 46} width={0.7} height={scaled * 92} rx="0.3" fill={fill}/>;
                  })}
                </g>
                {/* center line */}
                <line x1="0" y1="50" x2={AMPWAVE.length} y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4"/>
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
                  <div className="h-1 w-72 bg-ink-500 rounded overflow-hidden">
                    <div className="h-full bg-brand-cyan animate-pulse" style={{width:'48%'}}></div>
                  </div>
                  <div className="text-fg-dim text-sm num">증폭 처리 중… 48%</div>
                </div>
              </div>
            )}

            {/* Playhead */}
            {!isEmpty && (
              <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${(playSec/duration)*100}%`, width: 1 }}>
                <div className="absolute inset-y-0 -left-px w-[2px] bg-play"></div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-play"></div>
              </div>
            )}

            {/* Clipping warning band */}
            {!isEmpty && willClip && state !== 'processing' && (
              <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-err/15 border border-err/40 text-err text-[11px] flex items-center gap-1.5">
                <Icon name="warn" className="w-3 h-3" /> 클리핑 발생 가능
              </div>
            )}
          </div>
        </div>

        {/* Right: dB scale */}
        <div className="relative border-l border-line2/40 py-3">
          {!isEmpty && dbLabels.map((db, i) => {
            const top = 8 + (i / (dbLabels.length - 1)) * (height - 32);
            return (
              <div key={db} className="absolute right-2 num text-[10.5px] text-fg-mute" style={{ top: top - 6 }}>
                {db === 0 ? '0 dB' : `${db} dB`}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-line2/40">
        <div className="flex items-center gap-1.5">
          <ToolBtn><Icon name="zoom-out" /></ToolBtn>
          <ToolBtn><Icon name="zoom-in" /></ToolBtn>
          <ToolBtn><Icon name="fit" /></ToolBtn>
        </div>
        <div className="flex items-center gap-3 w-72">
          <button className="w-8 h-8 grid place-items-center rounded-md border border-line2 text-fg-dim hover:text-fg hover:bg-ink-600">
            <Icon name="play" className="w-3.5 h-3.5" />
          </button>
          <div className="relative h-1.5 flex-1 bg-ink-500 rounded-full">
            <div className="absolute inset-y-0 left-0 bg-fg-dim rounded-full" style={{ width: `${(playSec/duration)*100}%` }}></div>
            <div className="absolute -top-1 w-3.5 h-3.5 -translate-x-1/2 bg-fg rounded-full ring-2 ring-ink-700" style={{ left: `${(playSec/duration)*100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolBtn = ({ children, onClick }) => (
  <button onClick={onClick} className="w-8 h-8 grid place-items-center rounded-md border border-line2 text-fg-dim hover:text-fg hover:border-line2/80 hover:bg-ink-600">
    {children}
  </button>
);

window.AmpWaveformCard = AmpWaveformCard;
window.ToolBtn = ToolBtn;
window.fmt = fmt;
