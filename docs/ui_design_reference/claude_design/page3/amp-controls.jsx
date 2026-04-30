// Gain slider panel + RMS level meter panel
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

// dB slider with center notch and color zones
const GainSliderPanel = ({ gainDb, onChange, antiClip, onAntiClipChange, state }) => {
  const min = -20, max = 20;
  const pct = ((gainDb - min) / (max - min)) * 100;
  const disabled = state === 'empty' || state === 'processing';
  const sign = gainDb > 0 ? '+' : '';
  const valueColor = gainDb > 12 ? 'text-warn' : gainDb > 0 ? 'text-brand-cyan' : gainDb < 0 ? 'text-brand-indigo' : 'text-fg';

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[14px] font-semibold tracking-tight">Gain 조절</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={`${sign}${gainDb.toFixed(1)}`}
            className="w-16 h-8 px-2 rounded-md bg-ink-800 border border-line2 text-fg num text-[13px] text-right"
          />
          <span className="text-fg-mute text-[12px] num">dB</span>
        </div>
      </div>

      {/* Big value display */}
      <div className="flex items-baseline justify-center gap-1 my-3">
        <div className={`num text-[42px] font-semibold leading-none tracking-tight ${valueColor}`}>{sign}{gainDb.toFixed(1)}</div>
        <div className="text-[16px] text-fg-mute num">dB</div>
      </div>

      {/* Slider track with zones */}
      <div className="relative px-1 mb-2">
        <div className="relative h-2 rounded-full bg-ink-500 overflow-hidden">
          {/* warning zones */}
          <div className="absolute inset-y-0 left-0 bg-brand-indigo/20" style={{ width: '50%' }}></div>
          <div className="absolute inset-y-0 right-0 bg-brand-cyan/20" style={{ width: '50%' }}></div>
          <div className="absolute inset-y-0 right-0 bg-warn/30" style={{ width: '12.5%' }}></div>
          {/* fill from center */}
          {gainDb >= 0 ? (
            <div className="absolute inset-y-0 bg-brand-cyan" style={{ left: '50%', width: `${(gainDb / max) * 50}%` }}></div>
          ) : (
            <div className="absolute inset-y-0 bg-brand-indigo" style={{ right: '50%', width: `${(-gainDb / -min) * 50}%` }}></div>
          )}
          {/* center notch */}
          <div className="absolute top-0 bottom-0 w-px bg-fg/30" style={{ left: '50%' }}></div>
        </div>
        {/* Slider thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={0.1}
          value={gainDb}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute -top-1.5 w-5 h-5 -translate-x-1/2 rounded-full bg-fg ring-2 ring-ink-700 shadow-handle pointer-events-none"
          style={{ left: `${pct}%` }}
        ></div>
      </div>

      {/* tick labels */}
      <div className="flex justify-between text-[11px] text-fg-mute num px-1 mt-3">
        <span>-20 dB</span>
        <span>-10 dB</span>
        <span className="text-fg-dim">0 dB</span>
        <span>+10 dB</span>
        <span className="text-warn">+20 dB</span>
      </div>

      {/* Anti-clip toggle */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-line2/40">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onAntiClipChange(!antiClip)}
            disabled={disabled}
            className={`relative w-10 h-6 rounded-full transition-colors ${antiClip ? 'bg-brand-cyan' : 'bg-ink-500'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-fg shadow transition-transform ${antiClip ? 'translate-x-[18px]' : 'translate-x-0.5'}`}></span>
          </button>
          <span className="text-[13px] text-fg">Clipping 방지</span>
          <Icon name="info" className="w-3.5 h-3.5 text-fg-mute" />
        </div>
        <div className="text-[11px] text-fg-mute">
          {antiClip ? 'limiter on (-0.5 dBFS)' : '원본 그대로 출력'}
        </div>
      </div>
    </div>
  );
};

// RMS Level Meter
const LevelMeterPanel = ({ origDb = -14.2, gainDb = 0, antiClip = true }) => {
  const out = Math.min(antiClip ? -0.5 : 6, origDb + gainDb);
  const willClip = origDb + gainDb > 0;

  // Map dB (-48..0) to 0..100 percent
  const dbToPct = (db) => Math.max(0, Math.min(100, ((db + 48) / 48) * 100));
  const ticks = [-48, -24, -12, -6, 0];

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[14px] font-semibold tracking-tight">레벨 미터 (RMS)</div>
        <Icon name="meter" className="w-4 h-4 text-fg-mute" />
      </div>

      {/* tick row */}
      <div className="relative h-3 mb-1.5 ml-12">
        {ticks.map(t => (
          <div key={t} className="absolute -translate-x-1/2 num text-[10.5px] text-fg-mute" style={{ left: `${dbToPct(t)}%` }}>
            {t}
          </div>
        ))}
      </div>

      {/* Original meter */}
      <MeterRow label="원본" valueDb={origDb} dbToPct={dbToPct} />

      {/* Result meter */}
      <div className="mt-3">
        <MeterRow label="결과 (예상)" valueDb={out} dbToPct={dbToPct} clipped={willClip && !antiClip} />
      </div>

      {/* warning */}
      {willClip && !antiClip && (
        <div className="mt-3 flex items-center gap-2 text-err text-[11.5px]">
          <Icon name="warn" className="w-3.5 h-3.5" />
          0 dBFS 초과 — clipping 방지 사용 권장
        </div>
      )}
      {willClip && antiClip && (
        <div className="mt-3 flex items-center gap-2 text-warn text-[11.5px]">
          <Icon name="shield" className="w-3.5 h-3.5" />
          limiter가 피크를 -0.5 dBFS로 제한합니다
        </div>
      )}
    </div>
  );
};

const MeterRow = ({ label, valueDb, dbToPct, clipped }) => {
  const pct = dbToPct(valueDb);
  // segmented LEDs
  const segs = 32;
  const litCount = Math.floor((pct / 100) * segs);
  return (
    <div>
      <div className="grid items-center gap-2" style={{ gridTemplateColumns: '52px 1fr' }}>
        <div className="text-[12px] text-fg-dim">{label}</div>
        <div className="flex gap-[2px] h-3.5">
          {Array.from({ length: segs }).map((_, i) => {
            const segDb = -48 + (i / (segs - 1)) * 48;
            const lit = i <= litCount;
            let color;
            if (segDb > -3) color = clipped ? 'bg-err' : 'bg-warn';
            else if (segDb > -12) color = 'bg-warn/90';
            else color = 'bg-ok';
            return (
              <div key={i} className={`flex-1 rounded-[1.5px] ${lit ? color : 'bg-ink-500/60'}`}></div>
            );
          })}
        </div>
      </div>
      <div className="num text-[12px] mt-1 ml-[60px]">
        <span className={clipped ? 'text-err' : valueDb > -6 ? 'text-warn' : 'text-fg'}>
          {valueDb >= 0 ? '+' : ''}{valueDb.toFixed(1)} dB
        </span>
      </div>
    </div>
  );
};

window.Badge = Badge;
window.GainSliderPanel = GainSliderPanel;
window.LevelMeterPanel = LevelMeterPanel;
