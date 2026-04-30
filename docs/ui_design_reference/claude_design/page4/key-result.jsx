// Predicted Result, Guidance/Tip, Action Bar, and Conversion Result components

const PredictedResultCard = ({ state, semi, originalKey = 'A minor', unknown = false }) => {
  const noFile = state === 'empty';
  const t = transposeKey(unknown ? null : 9 /* A */, 'minor', semi); // A minor base
  const targetDisplay = noFile ? '--' : (unknown ? 'Unknown' : (t ? t.display : '--'));
  const tempoChanged = false;
  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="sparkle" className="w-4 h-4 text-brand-cyan" />
        <div className="text-[14px] font-semibold tracking-tight">예상 결과</div>
      </div>
      <div className="grid grid-cols-[1fr_24px_1fr_auto] items-center gap-3">
        <div>
          <div className="text-[11px] text-fg-mute mb-1">원본 Key</div>
          <div className={`num text-[20px] font-semibold tracking-tight ${noFile ? 'text-fg-faint' : unknown ? 'text-fg-mute' : 'text-fg-dim'}`}>
            {noFile ? '--' : (unknown ? 'Unknown' : originalKey)}
          </div>
        </div>
        <Icon name="arrow-right" className={`w-5 h-5 ${noFile ? 'text-fg-faint' : 'text-fg-mute'}`} />
        <div>
          <div className="text-[11px] text-fg-mute mb-1">변환 후 예상 Key</div>
          <div className={`num text-[20px] font-semibold tracking-tight ${
            noFile ? 'text-fg-faint' :
            unknown ? 'text-warn' :
            semi === 0 ? 'text-fg-dim' :
            'text-brand-cyan'
          }`}>
            {targetDisplay}
          </div>
        </div>
        <div className="pl-3 border-l border-line2/40 ml-2">
          <div className="text-[11px] text-fg-mute mb-1 flex items-center gap-1">템포 <Icon name="help" className="w-3 h-3" /></div>
          <div className={`text-[14px] font-medium ${tempoChanged ? 'text-warn' : 'text-ok'}`}>
            {noFile ? '--' : '유지'}
          </div>
        </div>
      </div>
    </div>
  );
};

const GuidanceCard = ({ unknown }) => (
  <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
    <div className="flex items-center gap-2 mb-3">
      <Icon name="info" className="w-4 h-4 text-brand-indigo" />
      <div className="text-[14px] font-semibold tracking-tight">안내 및 팁</div>
    </div>
    <div className="text-[13px] text-fg-dim leading-relaxed space-y-1.5">
      <p>Key가 정확히 감지되지 않았더라도 반음 단위 변환은 가능합니다.</p>
      <p>템포(BPM)는 변경되지 않고 유지됩니다.</p>
      {unknown && <p className="text-warn">분석 신뢰도가 낮은 경우 결과 파일명에 <span className="num">key_shift_+N</span> 형식이 사용됩니다.</p>}
    </div>
  </div>
);

const ActionBtn = ({ icon, label, primary, disabled, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
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

const ActionBar = ({ state, semi, onConvert, onReset }) => {
  const noFile = state === 'empty';
  const processing = state === 'processing';
  const success = state === 'success';
  const noChange = semi === 0;
  return (
    <div className="grid grid-cols-3 gap-3">
      <ActionBtn
        icon={processing ? 'sparkle' : 'key'}
        label={processing ? '변환 중…' : '변환 실행'}
        primary
        disabled={noFile || processing || noChange}
        onClick={onConvert}
      />
      <ActionBtn
        icon="play"
        label="결과 재생"
        disabled={!success}
      />
      <ActionBtn
        icon="reset"
        label="초기화"
        disabled={noFile || processing}
        onClick={onReset}
      />
    </div>
  );
};

// Mini waveform — used in conversion result row
const MiniWave = ({ color = '#5EE6D6' }) => (
  <svg viewBox="0 0 400 36" className="flex-1 h-9" preserveAspectRatio="none">
    {Array.from({ length: 180 }).map((_, i) => {
      const v = 0.25 + Math.abs(Math.sin(i * 0.41) * Math.cos(i * 0.17) * Math.sin(i * 0.09 + 1.2)) * 0.75;
      return <rect key={i} x={i * 2.2} y={18 - v * 16} width="1.3" height={v * 32} fill={color} opacity={0.85} />;
    })}
  </svg>
);

const ConversionResultCard = ({ state, semi, file = FILE_DEFAULT, unknown = false }) => {
  const t = transposeKey(unknown ? null : 9, 'minor', semi);
  const sign = semi >= 0 ? `+${semi}` : `${semi}`;
  const filename = unknown || !t
    ? `${file.name.replace(/\.mp3$/i, '')}(key_shift_${sign}).mp3`
    : `${file.name.replace(/\.mp3$/i, '')}(${t.fileSafe}).mp3`;

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5 mt-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="wave" className="w-4 h-4 text-brand-cyan" />
        <div className="text-[14px] font-semibold tracking-tight">변환 결과</div>
        {state === 'success' && <Badge tone="ok"><Icon name="check" className="w-3 h-3" />변환 완료</Badge>}
        {state === 'processing' && <Badge tone="cyan">처리 중…</Badge>}
        {state === 'error' && <Badge tone="err">실패</Badge>}
        {(state === 'empty' || state === 'uploaded') && <Badge tone="mute">대기</Badge>}
      </div>

      {state === 'success' && (
        <div className="grid items-center gap-4" style={{ gridTemplateColumns: '1fr 160px' }}>
          <div className="flex items-center gap-3 rounded-xl bg-ink-800 border border-line2/50 px-3 py-3">
            <button className="w-10 h-10 rounded-full bg-brand-cyan text-ink-900 grid place-items-center hover:bg-brand-cyan/90">
              <Icon name="play" className="w-4 h-4" />
            </button>
            <div className="min-w-[200px]">
              <div className="text-[13.5px] font-semibold tracking-tight">{filename}</div>
              <div className="text-[11.5px] text-fg-mute num">{file.duration}</div>
            </div>
            <MiniWave />
            <Icon name="speaker" className="w-4 h-4 text-fg-mute" />
            <button className="text-fg-mute hover:text-fg"><Icon name="dots" className="w-4 h-4" /></button>
          </div>
          <button className="h-12 rounded-lg border border-brand-cyan/60 text-brand-cyan hover:bg-brand-cyan/10 inline-flex items-center justify-center gap-2 font-medium text-[13.5px]">
            <Icon name="download" className="w-4 h-4" /> 다운로드
          </button>
          <div className="col-span-2 flex items-center gap-5 text-[11.5px] text-fg-mute num pt-1">
            <span>Key: <span className="text-fg-dim">{unknown ? 'Unknown' : (t ? t.display : '--')}</span></span>
            <span>BPM: <span className="text-fg-dim">128 (유지)</span></span>
            <span>반음 변화: <span className="text-fg-dim">{sign} semitone</span></span>
            <span>형식: MP3 · 320 kbps · 44.1 kHz</span>
          </div>
        </div>
      )}

      {state === 'processing' && (
        <div className="py-4">
          <div className="flex items-center gap-3 mb-3 text-fg-dim text-[13px]">
            <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            반음 단위로 키를 변환하는 중입니다…
          </div>
          <div className="h-1.5 bg-ink-500 rounded overflow-hidden">
            <div className="h-full bg-brand-cyan" style={{ width: '54%' }} />
          </div>
          <div className="num text-[11.5px] text-fg-mute mt-1.5">54% · 예상 소요 약 4초 · 템포 유지 중</div>
        </div>
      )}

      {state === 'uploaded' && (
        <div className="py-6 flex items-center gap-3 text-fg-mute text-[13px]">
          <Icon name="info" className="w-4 h-4" />
          [변환 실행]을 눌러 결과를 생성하세요. (semitone이 0이면 변환되지 않습니다.)
        </div>
      )}
      {state === 'empty' && (
        <div className="py-6 flex items-center gap-3 text-fg-mute text-[13px]">
          <Icon name="info" className="w-4 h-4" />
          파일을 업로드하면 변환 결과가 이곳에 표시됩니다.
        </div>
      )}
      {state === 'error' && (
        <div className="py-2">
          <div className="flex items-center gap-2 text-err text-[13px] font-medium mb-2">
            <Icon name="error" className="w-4 h-4" /> Key 변환 처리에 실패했습니다.
          </div>
          <div className="text-[12.5px] text-fg-dim leading-relaxed">
            피치 시프트 엔진에서 오류가 발생했습니다. 다른 mp3 파일로 다시 시도해 주세요.
          </div>
          <button className="mt-3 h-9 px-3 rounded-md border border-line2 text-fg hover:bg-ink-600 text-[12.5px]">다시 시도</button>
        </div>
      )}
    </div>
  );
};

window.PredictedResultCard = PredictedResultCard;
window.GuidanceCard = GuidanceCard;
window.ActionBar = ActionBar;
window.ActionBtn = ActionBtn;
window.ConversionResultCard = ConversionResultCard;
