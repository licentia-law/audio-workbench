// Master mix panel + Notice card for stems page

const StemMasterPanel = ({ state, fileBase, masterDb, onMasterChange, playing, onTogglePlay }) => {
  const peaks = React.useMemo(() => genStemWave(99, 380), []);
  const ready = state === 'success';
  const dbLabel = `${masterDb >= 0 ? '+' : ''}${masterDb.toFixed(1)} dB`;
  const ratio = (masterDb + 24) / 36;

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5 mt-5">
      <div className="grid items-center gap-5" style={{ gridTemplateColumns: '1fr 360px 220px' }}>
        {/* Mix waveform + play */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StemIcon name="mix" className="w-4 h-4 text-brand-cyan" />
            <div className="text-[14px] font-semibold tracking-tight">전체 Mix 재생</div>
            {ready && <Badge tone="ok"><Icon name="check" className="w-3 h-3"/>믹스 준비됨</Badge>}
            {!ready && <Badge tone="mute">대기</Badge>}
          </div>
          <div className="rounded-lg bg-ink-800 border border-line2/40 p-3 flex items-center gap-3">
            <button
              onClick={onTogglePlay}
              disabled={!ready}
              className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${ready ? 'bg-brand-cyan text-ink-900 hover:bg-brand-cyan/90' : 'bg-ink-500 text-fg-mute cursor-not-allowed'}`}>
              <Icon name={playing ? 'pause' : 'play'} className="w-4 h-4"/>
            </button>
            <div className="flex-1 min-w-0">
              <svg viewBox={`0 0 ${peaks.length} 60`} preserveAspectRatio="none" className="w-full h-12">
                <defs>
                  <linearGradient id="masterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7CF0E0"/><stop offset="1" stopColor="#2DBEAE"/>
                  </linearGradient>
                  <clipPath id="masterClip">
                    <rect x="0" y="0" width={peaks.length * 0.34} height="60"/>
                  </clipPath>
                </defs>
                <g fill="#3A4670" opacity={ready ? 0.6 : 0.3}>
                  {peaks.map((v,i) => <rect key={i} x={i+0.1} y={30 - v*27} width={0.8} height={v*54} rx="0.3"/>)}
                </g>
                {ready && (
                  <g fill="url(#masterGrad)" clipPath="url(#masterClip)">
                    {peaks.map((v,i) => <rect key={i} x={i+0.1} y={30 - v*27} width={0.8} height={v*54} rx="0.3"/>)}
                  </g>
                )}
                {ready && playing && (
                  <line x1={peaks.length * 0.34} y1="0" x2={peaks.length * 0.34} y2="60" stroke="#FFB347" strokeWidth="0.6"/>
                )}
              </svg>
              <div className="flex items-center justify-between mt-1">
                <div className="num text-[11px] text-fg-mute">{playing ? '01:16' : '00:00'} / 03:42</div>
                <div className="text-[11px] text-fg-mute">실시간 믹스 — 채널 음량 변경 시 즉시 반영</div>
              </div>
            </div>
          </div>
        </div>

        {/* Master volume */}
        <div className="border-l border-line2/40 pl-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13px] font-semibold tracking-tight">마스터 음량</div>
            <div className="num text-[12px] px-2 h-6 rounded border border-line2 bg-ink-800 flex items-center" style={{minWidth:64, justifyContent:'center'}}>
              {dbLabel}
            </div>
          </div>
          {/* horizontal slider */}
          <div className="relative h-8">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-ink-800 rounded-full border border-line2/50"></div>
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-brand-cyanDeep to-brand-cyan"
              style={{ left: 0, width: `${ratio*100}%` }}/>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-fg ring-2 ring-brand-cyan shadow"
              style={{ left: `calc(${ratio*100}% - 8px)` }}/>
            {/* center 0 dB tick */}
            <div className="absolute top-0 bottom-0 w-px bg-fg-mute/40" style={{ left: `${(24/36)*100}%` }}/>
          </div>
          <div className="flex justify-between num text-[10px] text-fg-mute mt-2">
            <span>-∞</span><span>-24</span><span>-12</span><span>0</span><span>+12</span>
          </div>
          <input type="range" min={-24} max={12} step={0.1} value={masterDb} onChange={e => onMasterChange(parseFloat(e.target.value))} className="sr-only"/>
        </div>

        {/* Mixed download */}
        <div>
          <button
            disabled={!ready}
            className={`w-full h-12 rounded-lg inline-flex items-center justify-center gap-2 text-[13.5px] font-semibold ${ready ? 'bg-brand-cyan text-ink-900 hover:bg-brand-cyan/90' : 'bg-ink-500 text-fg-mute cursor-not-allowed'}`}>
            <Icon name="download" className="w-4 h-4"/> Mixed 다운로드
          </button>
          <div className="mt-2 rounded-md bg-ink-800 border border-line2/40 px-3 py-2">
            <div className="num text-[12.5px] font-medium" style={{color: ready ? '#5EE6D6' : '#6E769B'}}>
              {fileBase}(mixed).mp3
            </div>
            <div className="num text-[10.5px] text-fg-mute mt-0.5">MP3 · 320 kbps · 44.1 kHz</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StemNoticeCard = ({ state }) => (
  <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-4 mt-5 flex items-start gap-3">
    <div className="w-8 h-8 shrink-0 rounded-lg bg-brand-indigo/15 text-brand-indigo grid place-items-center">
      <Icon name="info" className="w-4 h-4"/>
    </div>
    <div className="flex-1">
      <div className="text-[13.5px] font-semibold mb-1">안내 및 참고사항</div>
      <ul className="text-[12.5px] text-fg-dim leading-relaxed list-disc pl-4 marker:text-fg-faint">
        <li>스템 분리는 AI 기반 분석이며, 완벽한 분리가 보장되지는 않습니다.</li>
        <li>곡 특성(장르·믹스 밀도)에 따라 잔향·누락·잡음이 포함될 수 있어 실용적 참고 용도로 사용해 주세요.</li>
        <li>분리에는 1~2분이 소요될 수 있으며, 처리 중에는 다른 페이지로 이동해도 작업이 유지됩니다.</li>
        {state === 'error' && <li className="text-err">분리에 실패했습니다. 다른 mp3 파일로 다시 시도하거나, 길이를 줄여 보세요.</li>}
      </ul>
    </div>
  </div>
);

window.StemMasterPanel = StemMasterPanel;
window.StemNoticeCard = StemNoticeCard;
