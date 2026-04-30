// StemMasterPanel + StemNoticeCard

// Deterministic mix waveform (blended multi-stem envelope)
function genMixWave(N = 500) {
  let s = 42;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const arr = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const env =
      0.35 +
      0.50 * Math.pow(Math.sin(t * Math.PI), 0.6) +
      0.15 * Math.sin(t * Math.PI * 7) +
      (t > 0.52 && t < 0.60 ? -0.20 : 0) +
      (t > 0.88 ? -0.12 * (t - 0.88) * 8 : 0);
    const noise = (rnd() - 0.5) * 0.42;
    arr.push(Math.max(0.06, Math.min(1, env + noise)));
  }
  return arr;
}
const MIX_WAVE = genMixWave(500);

// ─── StemMasterPanel ────────────────────────────────────────────────────────
// Layout: 1fr (waveform + transport) | 360px (master slider) | 220px (download)
const StemMasterPanel = ({
  state       = 'empty',
  fileBase    = 'song',
  masterDb    = -1.0,
  onMasterChange = () => {},
  playing     = false,
  onTogglePlay   = () => {},
}) => {
  const ready    = state === 'success';
  const min = -24, max = 12;
  const pct      = ((masterDb - min) / (max - min)) * 100;
  const zeroPct  = ((0        - min) / (max - min)) * 100; // ≈ 66.7 %
  const sign     = masterDb >= 0 ? '+' : '';
  const dbLabel  = masterDb <= -23.9 ? '-∞' : `${sign}${masterDb.toFixed(1)}`;
  const PLAYHEAD = 0.28; // mock playback progress

  const valueColor = !ready
    ? 'text-fg-faint'
    : masterDb > 6  ? 'text-warn'
    : masterDb < 0  ? 'text-brand-indigo'
    :                 'text-brand-cyan';

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card mt-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-line2/40">
        <div className="w-7 h-7 rounded-md bg-brand-cyan/15 border border-brand-cyan/30 grid place-items-center text-brand-cyan">
          <StemIcon name="mix" className="w-4 h-4" />
        </div>
        <div className="text-[14px] font-semibold tracking-tight">마스터 믹스</div>
        {ready                                  && <Badge tone="ok"><Icon name="check" className="w-3 h-3"/>믹스 준비</Badge>}
        {state === 'processing'                 && <Badge tone="cyan">분리 중…</Badge>}
        {state === 'error'                      && <Badge tone="err">실패</Badge>}
        {(state === 'empty' || state === 'uploaded') && <Badge tone="mute">대기</Badge>}
      </div>

      {/* ── 3-col body ── */}
      <div className="grid p-5 gap-5" style={{ gridTemplateColumns: '1fr 360px 220px' }}>

        {/* Left — mix waveform + transport */}
        <div className="flex flex-col gap-2">
          <div className="text-[12px] text-fg-mute">믹스 파형</div>
          <div className="rounded-xl bg-ink-800 border border-line2/40 p-3 flex flex-col justify-between flex-1">
            {/* SVG waveform */}
            <div className="relative">
              <svg
                viewBox={`0 0 ${MIX_WAVE.length} 100`}
                preserveAspectRatio="none"
                className="w-full h-[64px]"
              >
                <defs>
                  <linearGradient id="mwDim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3A4670"/>
                    <stop offset="1" stopColor="#222B47"/>
                  </linearGradient>
                  <linearGradient id="mwHot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7CF0E0"/>
                    <stop offset="1" stopColor="#2DBEAE"/>
                  </linearGradient>
                  <clipPath id="mwPlayed">
                    <rect x="0" y="0" width={MIX_WAVE.length * PLAYHEAD} height="100"/>
                  </clipPath>
                </defs>

                {/* dim bars */}
                <g fill="url(#mwDim)" opacity={ready ? 1 : 0.3}>
                  {MIX_WAVE.map((v, i) => (
                    <rect key={i} x={i + 0.15} y={50 - v * 44} width={0.7} height={v * 88} rx="0.3"/>
                  ))}
                </g>

                {/* hot bars (played portion) */}
                {ready && (
                  <g fill="url(#mwHot)" clipPath="url(#mwPlayed)">
                    {MIX_WAVE.map((v, i) => (
                      <rect key={i} x={i + 0.15} y={50 - v * 44} width={0.7} height={v * 88} rx="0.3"/>
                    ))}
                  </g>
                )}

                {/* playhead */}
                {ready && (
                  <line
                    x1={MIX_WAVE.length * PLAYHEAD} y1="0"
                    x2={MIX_WAVE.length * PLAYHEAD} y2="100"
                    stroke="#FFB347" strokeWidth="0.8"
                  />
                )}

                {/* dim overlay when not ready */}
                {!ready && (
                  <rect x="0" y="0" width={MIX_WAVE.length} height="100" fill="rgba(7,11,24,0.55)"/>
                )}
              </svg>

              {/* placeholder text */}
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center text-[12px] text-fg-mute pointer-events-none">
                  스템 분리 후 활성화됩니다
                </div>
              )}
            </div>

            {/* transport */}
            <div className="flex items-center justify-between mt-2.5">
              <button
                disabled={!ready}
                onClick={onTogglePlay}
                className={`w-9 h-9 rounded-full grid place-items-center transition-colors ${
                  ready
                    ? 'bg-brand-cyan text-ink-900 hover:bg-brand-cyan/90'
                    : 'bg-ink-500 text-fg-faint cursor-not-allowed'
                }`}
              >
                <Icon name={playing ? 'pause' : 'play'} className="w-4 h-4" />
              </button>
              <div className="num text-[11px] text-fg-mute">
                {ready ? (playing ? '01:05 / 03:42' : '00:00 / 03:42') : '--:-- / --:--'}
              </div>
            </div>
          </div>
        </div>

        {/* Center — master volume slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-[12px] text-fg-mute">마스터 음량</div>
            <div className={`num text-[13px] font-semibold ${ready ? (masterDb > 6 ? 'text-warn' : 'text-fg') : 'text-fg-faint'}`}>
              {ready ? `${dbLabel} dB` : '-- dB'}
            </div>
          </div>

          <div className={`rounded-xl bg-ink-800 border border-line2/40 p-4 flex flex-col gap-3 flex-1 justify-center ${!ready ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* big value */}
            <div className="flex items-baseline justify-center gap-1">
              <div className={`num text-[42px] font-semibold leading-none tracking-tight ${valueColor}`}>
                {ready ? dbLabel : '--'}
              </div>
              <div className="num text-[14px] text-fg-mute">dB</div>
            </div>

            {/* slider track */}
            <div className="relative select-none px-2">
              <div className="relative h-2 rounded-full bg-ink-500">
                {/* zone tints */}
                <div className="absolute inset-y-0 left-0 rounded-l-full bg-brand-indigo/20"
                  style={{ width: `${zeroPct}%` }}/>
                <div className="absolute inset-y-0 rounded-r-full bg-warn/20"
                  style={{ left: '75%', right: 0 }}/>

                {/* fill bar */}
                {masterDb >= 0 ? (
                  <div className="absolute inset-y-0 rounded-full bg-brand-cyan"
                    style={{ left: `${zeroPct}%`, width: `${Math.max(0, pct - zeroPct)}%` }}/>
                ) : (
                  <div className="absolute inset-y-0 rounded-full bg-brand-indigo"
                    style={{ left: `${pct}%`, width: `${Math.max(0, zeroPct - pct)}%` }}/>
                )}

                {/* 0 dB notch */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-px h-4 bg-fg-mute/60"
                  style={{ left: `${zeroPct}%` }}
                />

                {/* native range input (transparent overlay) */}
                <input
                  type="range"
                  min={min} max={max} step={0.1}
                  value={masterDb}
                  onChange={(e) => onMasterChange(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ margin: 0 }}
                />

                {/* thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-fg ring-2 ring-ink-700 shadow-handle pointer-events-none"
                  style={{ left: `${pct}%` }}
                />
              </div>

              {/* tick labels */}
              <div className="flex justify-between text-[10.5px] text-fg-mute num mt-2.5">
                <span>-24</span>
                <span>-12</span>
                <span className="text-fg-dim font-medium">0</span>
                <span>+6</span>
                <span className="text-warn">+12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Mixed download */}
        <div className="flex flex-col gap-2">
          <div className="text-[12px] text-fg-mute">Mixed 저장</div>
          <div className="rounded-xl bg-ink-800 border border-line2/40 p-4 flex flex-col justify-between flex-1">
            <div className="text-[12.5px] text-fg-dim leading-relaxed">
              현재 페이더 설정으로 4개 채널을 합산한 결과를 저장합니다.
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                disabled={!ready}
                className={`h-12 rounded-lg inline-flex items-center justify-center gap-2 text-[13.5px] font-semibold border transition-colors ${
                  ready
                    ? 'bg-brand-cyan text-ink-900 border-brand-cyan hover:bg-brand-cyan/90'
                    : 'bg-ink-500 text-fg-mute border-line2 cursor-not-allowed'
                }`}
              >
                <Icon name="download" className="w-4 h-4" />
                Mixed 다운로드
              </button>

              {ready && (
                <div className="num text-[11px] text-fg-mute text-center" dir="ltr">
                  {fileBase}(mixed).mp3
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── StemNoticeCard ──────────────────────────────────────────────────────────
const StemNoticeCard = ({ state }) => {
  const isErr = state === 'error';
  return (
    <div className={`mt-5 rounded-2xl border px-5 py-4 flex items-start gap-3.5 ${
      isErr ? 'bg-err/8 border-err/35' : 'bg-ink-700 border-line'
    }`}>
      <div className="w-9 h-9 rounded-full bg-ink-800/60 border border-line2/40 grid place-items-center shrink-0">
        <Icon
          name={isErr ? 'error' : 'info'}
          className={`w-4 h-4 ${isErr ? 'text-err' : 'text-fg-mute'}`}
        />
      </div>
      <ul className="text-[12.5px] text-fg-dim leading-relaxed space-y-1.5 flex-1 list-none p-0 m-0">
        {isErr && (
          <li className="text-err font-medium text-[13px]">분리에 실패했습니다.</li>
        )}
        <li>스템 분리는 AI 기반 분석이며, 완벽한 분리가 보장되지 않습니다.</li>
        <li>분리 처리 중 다른 페이지로 이동해도 작업이 유지됩니다.</li>
        {isErr && (
          <li className="text-err">다른 mp3 파일로 다시 시도하거나 파일 길이를 줄여보세요.</li>
        )}
      </ul>
    </div>
  );
};

window.StemMasterPanel = StemMasterPanel;
window.StemNoticeCard   = StemNoticeCard;
