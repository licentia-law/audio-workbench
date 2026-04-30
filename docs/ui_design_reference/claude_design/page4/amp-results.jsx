// Control bar (3 buttons), Result card, Guidance card for Amplify
const ActionBtn = ({ icon, label, primary, disabled, danger }) => (
  <button
    disabled={disabled}
    className={[
      'h-12 px-4 rounded-lg inline-flex items-center justify-center gap-2 text-[13.5px] font-medium border transition-colors',
      primary
        ? 'bg-brand-cyan text-ink-900 border-brand-cyan hover:bg-brand-cyan/90 disabled:bg-ink-500 disabled:text-fg-mute disabled:border-line2'
        : 'bg-ink-700 text-fg border-line2 hover:bg-ink-600 disabled:bg-ink-700 disabled:text-fg-faint disabled:border-line',
      disabled ? 'cursor-not-allowed opacity-80' : '',
    ].join(' ')}>
    <Icon name={icon} className="w-4 h-4" />
    {label}
  </button>
);

const AmpControlBar = ({ state }) => {
  const noFile = state === 'empty';
  const proc = state === 'processing';
  const renderDisabled = noFile || proc;
  return (
    <div className="grid grid-cols-3 gap-3 mt-5">
      <ActionBtn icon="play"    label="원본 재생"    disabled={noFile} />
      <ActionBtn icon="play"    label="결과 미리듣기" disabled={noFile || state === 'uploaded' || proc} />
      <ActionBtn icon="sparkle" label={proc ? '렌더링 중…' : '적용 / 렌더링'} primary disabled={renderDisabled} />
    </div>
  );
};

// Result file card with mini waveform
const AmpResultCard = ({ state, file, gainDb, antiClip }) => {
  const sign = gainDb > 0 ? '+' : '';
  const ampName = `${file.baseName}(${sign}${gainDb.toFixed(1)}dB).mp3`;
  const ampSize = (parseFloat(file.size) * (1 + Math.max(0, gainDb) * 0.005)).toFixed(1);

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5 min-h-[156px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-[14px] font-semibold tracking-tight">결과 파일</div>
          {state === 'success' && <Badge tone="ok"><Icon name="check" className="w-3 h-3"/>생성 완료</Badge>}
          {state === 'processing' && <Badge tone="cyan">처리 중…</Badge>}
          {state === 'error' && <Badge tone="err">실패</Badge>}
          {(state==='empty' || state==='uploaded') && <Badge tone="mute">대기</Badge>}
        </div>
      </div>

      {state === 'success' && (
        <div className="grid items-center gap-4" style={{ gridTemplateColumns: '1fr 140px' }}>
          <div className="flex items-center gap-3 rounded-xl bg-ink-800 border border-line2/50 px-3 py-3">
            <button className="w-10 h-10 rounded-full bg-brand-cyan text-ink-900 grid place-items-center hover:bg-brand-cyan/90">
              <Icon name="play" className="w-4 h-4" />
            </button>
            <div className="min-w-[150px]">
              <div className="text-[13.5px] font-semibold tracking-tight">{ampName}</div>
              <div className="text-[11.5px] text-fg-mute num">{file.duration}</div>
            </div>
            <svg viewBox="0 0 200 36" className="flex-1 h-9">
              {Array.from({length: 100}).map((_,i) => {
                const v = 0.3 + Math.abs(Math.sin(i*0.6) * Math.cos(i*0.21)) * 0.7;
                const amp = Math.min(1, v * Math.pow(10, gainDb / 20));
                return <rect key={i} x={i*2} y={18 - amp*16} width="1.2" height={amp*32} fill="#5AC4E8" opacity={0.85}/>;
              })}
            </svg>
            <Icon name="speaker" className="w-4 h-4 text-fg-mute" />
            <button className="text-fg-mute hover:text-fg"><Icon name="dots" className="w-4 h-4"/></button>
          </div>
          <button className="h-12 rounded-lg border border-brand-cyan/60 text-brand-cyan hover:bg-brand-cyan/10 inline-flex items-center justify-center gap-2 font-medium text-[13.5px]">
            <Icon name="download" className="w-4 h-4" /> 다운로드
          </button>
          <div className="col-span-2 text-[11.5px] text-fg-mute num pt-1">
            형식: MP3 · 크기: {ampSize}MB · 샘플레이트: 44.1 kHz · 비트레이트: 320 kbps {antiClip ? '· limiter on' : ''}
          </div>
        </div>
      )}

      {state === 'processing' && (
        <div className="py-4">
          <div className="flex items-center gap-3 mb-3 text-fg-dim text-[13px]">
            <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></div>
            gain {sign}{gainDb.toFixed(1)} dB 적용 중…
          </div>
          <div className="h-1.5 bg-ink-500 rounded overflow-hidden">
            <div className="h-full bg-brand-cyan" style={{width:'48%'}}></div>
          </div>
          <div className="num text-[11.5px] text-fg-mute mt-1.5">48% · 예상 소요 약 3초</div>
        </div>
      )}

      {state === 'uploaded' && (
        <div className="py-6 flex items-center gap-3 text-fg-mute text-[13px]">
          <Icon name="info" className="w-4 h-4" />
          gain 값을 조절한 뒤 [적용 / 렌더링]을 눌러 결과를 생성하세요.
        </div>
      )}
      {state === 'empty' && (
        <div className="py-6 flex items-center gap-3 text-fg-mute text-[13px]">
          <Icon name="info" className="w-4 h-4" />
          파일을 업로드하면 증폭 결과가 이곳에 표시됩니다.
        </div>
      )}
      {state === 'error' && (
        <div className="py-2">
          <div className="flex items-center gap-2 text-err text-[13px] font-medium mb-2">
            <Icon name="error" className="w-4 h-4" /> 처리에 실패했습니다.
          </div>
          <div className="text-[12.5px] text-fg-dim leading-relaxed">
            증폭 처리 중 오류가 발생했습니다. 다른 mp3 파일로 다시 시도해 주세요.
          </div>
          <button className="mt-3 h-9 px-3 rounded-md border border-line2 text-fg hover:bg-ink-600 text-[12.5px]">다시 시도</button>
        </div>
      )}
    </div>
  );
};

// Guidance card
const AmpGuidanceCard = ({ gainDb, antiClip, willClip }) => {
  const overAmp = gainDb > 12;
  const items = [
    { tone: overAmp ? 'warn' : 'mute', text: '과도한 증폭은 음질 저하를 유발할 수 있습니다.', icon: overAmp ? 'warn' : 'info' },
    { tone: willClip ? (antiClip ? 'ok' : 'err') : 'mute', text: 'Clipping 방지 옵션 사용을 권장합니다.', icon: willClip ? (antiClip ? 'circle-check' : 'error') : 'info' },
    { tone: 'ok', text: '적절한 gain 설정으로 최적의 음질을 유지하세요.', icon: 'circle-check' },
  ];
  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="info" className="w-4 h-4 text-fg-dim" />
        <div className="text-[14px] font-semibold tracking-tight">안내 및 주의사항</div>
      </div>
      <ul className="flex flex-col gap-2.5">
        {items.map((it,i) => (
          <li key={i} className="flex items-start gap-2.5 text-[13px]">
            <Icon name={it.icon} className={`w-4 h-4 mt-0.5 ${
              it.tone==='ok' ? 'text-ok' :
              it.tone==='warn' ? 'text-warn' :
              it.tone==='err' ? 'text-err' : 'text-fg-mute'
            }`} />
            <span className={
              it.tone==='err' ? 'text-err' :
              it.tone==='warn' ? 'text-warn' :
              it.tone==='ok' ? 'text-fg-dim' : 'text-fg-dim'
            }>{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

window.ActionBtn = ActionBtn;
window.AmpControlBar = AmpControlBar;
window.AmpResultCard = AmpResultCard;
window.AmpGuidanceCard = AmpGuidanceCard;
