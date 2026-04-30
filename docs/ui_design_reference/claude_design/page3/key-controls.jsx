// Source key info & semitone → key conversion utility
// Notes circle (sharps used for ascending). For minor key transposition we
// keep mode and rotate within the same set.
const NOTE_SHARPS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_FLATS  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

// Returns { display, fileSafe } for transposed key
function transposeKey(rootIdx, mode, semi) {
  if (rootIdx == null || semi == null) return null;
  const idx = ((rootIdx + semi) % 12 + 12) % 12;
  // Prefer sharps when going up, flats when going down
  const useFlat = semi < 0;
  const note = useFlat ? NOTE_FLATS[idx] : NOTE_SHARPS[idx];
  const modeLabel = mode === 'minor' ? 'minor' : 'Major';
  const display = `${note} ${modeLabel}`;
  const safeNote = note.replace('#','_sharp').replace('b','_flat');
  const fileSafe = `${safeNote}_${modeLabel}`;
  return { display, fileSafe, note, mode: modeLabel };
}

// Original Info Card — shows analyzed key/bpm + play original button
const OriginalInfoCard = ({ state, originalKey = 'A minor', originalBpm = 128, unknown = false }) => {
  const noFile = state === 'empty';
  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="wave" className="w-4 h-4 text-brand-cyan" />
        <div className="text-[14px] font-semibold tracking-tight">원본 정보</div>
        {unknown && !noFile && <Badge tone="warn">분석 신뢰도 낮음</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-ink-800 border border-line2/50 px-4 py-3.5">
          <div className="text-[11px] text-fg-mute mb-1">원본 Key</div>
          <div className={`num text-[20px] font-semibold tracking-tight ${noFile ? 'text-fg-faint' : unknown ? 'text-fg-mute' : 'text-brand-cyan'}`}>
            {noFile ? '--' : unknown ? 'Unknown' : originalKey}
          </div>
        </div>
        <div className="rounded-xl bg-ink-800 border border-line2/50 px-4 py-3.5">
          <div className="text-[11px] text-fg-mute mb-1">원본 BPM</div>
          <div className={`num text-[20px] font-semibold tracking-tight ${noFile ? 'text-fg-faint' : 'text-fg'}`}>
            {noFile ? '--' : `${originalBpm}`}
          </div>
        </div>
      </div>

      <button
        disabled={noFile}
        className={`mt-auto h-11 rounded-lg inline-flex items-center justify-center gap-2 text-[13.5px] font-medium border ${
          noFile
            ? 'bg-ink-700 text-fg-faint border-line cursor-not-allowed'
            : 'bg-ink-700 text-fg border-line2 hover:bg-ink-600'
        }`}>
        <Icon name="play" className="w-4 h-4" /> 원본 재생
      </button>
    </div>
  );
};

// Semitone control — current value, − / value / +, and slider track
const SemitoneControl = ({ state, semi = 3, onChange = () => {} }) => {
  const noFile = state === 'empty';
  const lock = noFile || state === 'processing';
  const min = -12, max = 12;
  const ticks = [-12, -9, -6, -3, 0, 3, 6, 9, 12];

  const dec = () => !lock && onChange(Math.max(min, semi - 1));
  const inc = () => !lock && onChange(Math.min(max, semi + 1));

  // Slider drag
  const trackRef = React.useRef(null);
  const startDrag = (e) => {
    if (lock) return;
    const rect = trackRef.current.getBoundingClientRect();
    const set = (clientX) => {
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const v = Math.round((x / rect.width) * (max - min) + min);
      onChange(v);
    };
    set(e.clientX);
    const move = (ev) => set(ev.clientX);
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const pct = ((semi - min) / (max - min)) * 100;
  const zeroPct = ((0 - min) / (max - min)) * 100;
  const posWidth = Math.abs(pct - zeroPct);
  const posLeft = pct >= zeroPct ? zeroPct : pct;

  const sign = semi > 0 ? '+' : (semi < 0 ? '' : '±');
  const valueText = `${sign}${semi}`;

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5 col-span-2">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="music" className="w-4 h-4 text-brand-cyan" />
        <div className="text-[14px] font-semibold tracking-tight">반음(Key) 조절</div>
        <Icon name="help" className="w-3.5 h-3.5 text-fg-mute" />
        <div className="ml-auto text-[11px] text-fg-mute num">범위 −12 ~ +12 semitone</div>
      </div>

      {/* big number */}
      <div className="flex items-baseline justify-center gap-3 py-3">
        <div className={`num text-[64px] font-semibold tracking-tight leading-none ${
          lock ? 'text-fg-faint' :
          semi > 0 ? 'text-brand-cyan' :
          semi < 0 ? 'text-brand-indigo' :
          'text-fg'
        }`}>
          {valueText}
        </div>
        <div className="text-[15px] text-fg-mute">semitone</div>
      </div>

      {/* −/value/+ stepper */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <button onClick={dec} disabled={lock || semi <= min}
          className="w-10 h-10 rounded-md border border-line2 text-fg-dim hover:text-fg hover:bg-ink-600 disabled:opacity-40 disabled:cursor-not-allowed grid place-items-center">
          <Icon name="minus" className="w-4 h-4" />
        </button>
        <div className="w-28 h-10 rounded-md border border-line2 bg-ink-800 grid place-items-center num text-[16px] font-semibold tracking-tight">
          {valueText}
        </div>
        <button onClick={inc} disabled={lock || semi >= max}
          className="w-10 h-10 rounded-md border border-line2 text-fg-dim hover:text-fg hover:bg-ink-600 disabled:opacity-40 disabled:cursor-not-allowed grid place-items-center">
          <Icon name="plus" className="w-4 h-4" />
        </button>
      </div>

      {/* tick labels */}
      <div className="relative px-1">
        <div className="flex justify-between mb-1.5 px-0.5">
          {ticks.map(t => {
            const active = t === semi;
            const isZero = t === 0;
            return (
              <div key={t} className={`num text-[11px] tabular-nums ${
                active ? 'text-brand-cyan font-semibold' :
                isZero ? 'text-fg-dim' : 'text-fg-mute'
              }`}>
                {t > 0 ? `+${t}` : t}
              </div>
            );
          })}
        </div>

        {/* track */}
        <div ref={trackRef} onMouseDown={startDrag}
          className={`relative h-2 rounded-full bg-ink-500 ${lock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          {/* base ticks */}
          {ticks.map(t => {
            const left = ((t - min) / (max - min)) * 100;
            return (
              <div key={t} className="absolute top-1/2 -translate-y-1/2 w-px h-2.5 bg-line2" style={{ left: `${left}%` }} />
            );
          })}
          {/* zero ref */}
          <div className="absolute top-1/2 -translate-y-1/2 w-[2px] h-3.5 bg-fg-mute/70" style={{ left: `${zeroPct}%` }} />
          {/* progress (from 0 to current) */}
          <div className="absolute top-0 bottom-0 rounded-full"
            style={{
              left: `${posLeft}%`,
              width: `${posWidth}%`,
              background: 'linear-gradient(90deg, rgba(94,230,214,0.6), rgba(94,230,214,0.95))'
            }} />
          {/* thumb */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-fg shadow-handle ring-2 ring-brand-cyan"
            style={{ left: `${pct}%` }} />
        </div>

        <div className="flex justify-between mt-2 text-[11px] text-fg-mute">
          <span>낮아짐</span>
          <span>원본</span>
          <span>높아짐</span>
        </div>
      </div>
    </div>
  );
};

window.transposeKey = transposeKey;
window.OriginalInfoCard = OriginalInfoCard;
window.SemitoneControl = SemitoneControl;
