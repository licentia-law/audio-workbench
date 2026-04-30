// Action button (same primary-cyan / outline-ink pattern as page1)
const ActionBtn = ({ icon, label, primary, disabled, danger, onClick, full }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={[
      'h-12 px-5 rounded-lg inline-flex items-center justify-center gap-2 text-[13.5px] font-medium border transition-colors',
      full ? 'w-full' : '',
      primary
        ? 'bg-brand-cyan text-ink-900 border-brand-cyan hover:bg-brand-cyan/90 disabled:bg-ink-500 disabled:text-fg-mute disabled:border-line2'
        : 'bg-ink-700 text-fg border-line2 hover:bg-ink-600 disabled:bg-ink-700 disabled:text-fg-faint disabled:border-line',
      disabled ? 'cursor-not-allowed opacity-80' : '',
    ].join(' ')}>
    <Icon name={icon} className="w-4 h-4" />
    {label}
  </button>
);

// === Run / playback bar ===
// 좌: 원본 재생 (outline) · 우: 분석 실행 (primary). 상태별 라벨/disabled 변경.
const RunBar = ({ state }) => {
  const noFile = state === 'empty';
  const running = state === 'processing';
  const runLabel =
    state === 'processing' ? '분석 중…' :
    state === 'success'    ? '다시 분석' :
    state === 'error'      ? '다시 시도' : '분석 실행';
  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card mt-5 p-3 pl-4 flex items-center justify-between">
      <ActionBtn icon="play" label="원본 재생" disabled={noFile || running} />
      <ActionBtn icon="analyze" label={runLabel} primary disabled={noFile || running} />
    </div>
  );
};

// === Big-number result card (Key, BPM) ===
// state: empty | uploaded | processing | success | error
// progress: 0..1 (only used in processing)
// emphasizesUnknown — when value === 'Unknown' show warn tone instead of cyan
const ResultBigCard = ({
  icon,
  title,
  state,
  value,        // big number/text
  unit,         // small unit on the right of the value
  caption,      // bottom caption ('조성', '템포', etc)
  captionSub,   // bottom right (small label like 'A 마이너')
  progress = 0,
  unknown = false,
}) => {
  const valueTone =
    state === 'success'
      ? unknown
        ? 'text-warn'
        : 'text-brand-cyan'
      : 'text-fg-faint';

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5 min-h-[220px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-ink-800 border border-line2/50 grid place-items-center text-fg-dim">
            <Icon name={icon} className="w-4 h-4" />
          </div>
          <div className="text-[14px] font-semibold tracking-tight">{title}</div>
        </div>
        {state === 'success'    && (unknown
          ? <Badge tone="warn"><Icon name="warn" className="w-3 h-3"/>Unknown</Badge>
          : <Badge tone="ok"><Icon name="check" className="w-3 h-3"/>분석 완료</Badge>)}
        {state === 'processing' && <Badge tone="cyan">분석 중…</Badge>}
        {state === 'error'      && <Badge tone="err"><Icon name="error" className="w-3 h-3"/>실패</Badge>}
        {(state === 'empty' || state === 'uploaded') && <Badge tone="mute">대기</Badge>}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col justify-center">
        {state === 'success' && (
          <div className="flex items-baseline gap-2">
            <div className={`num text-[64px] leading-none font-semibold tracking-tight ${valueTone}`}>{value}</div>
            {unit && <div className="num text-[15px] text-fg-mute mb-1.5">{unit}</div>}
          </div>
        )}

        {state === 'processing' && (
          <div className="space-y-3 py-2">
            <div className="num text-[40px] leading-none font-semibold tracking-tight text-fg-faint">— —</div>
            <div className="h-1.5 bg-ink-500 rounded overflow-hidden">
              <div className="h-full bg-brand-cyan transition-all" style={{ width: `${Math.round(progress*100)}%` }}></div>
            </div>
            <div className="num text-[11.5px] text-fg-mute">{Math.round(progress*100)}% · 추정 중</div>
          </div>
        )}

        {(state === 'empty' || state === 'uploaded') && (
          <div className="num text-[64px] leading-none font-semibold tracking-tight text-fg-faint">— —</div>
        )}

        {state === 'error' && (
          <div>
            <div className="num text-[40px] leading-none font-semibold tracking-tight text-warn">Unknown</div>
            <div className="text-[12px] text-fg-mute mt-2">분석에 실패했습니다.</div>
          </div>
        )}
      </div>

      {/* Footer caption */}
      <div className="flex items-end justify-between pt-3 border-t border-line2/40 mt-3">
        <div className="text-[12px] text-fg-mute">{caption}</div>
        {state === 'success' && captionSub && (
          <div className="text-[12px] text-fg-dim num">{captionSub}</div>
        )}
      </div>
    </div>
  );
};

// === Notice / guidance card (third column, image-style 안내 카드) ===
// 페이지 레퍼런스 이미지의 우측 안내 카드를 동일 톤으로 재현 — 작은 파형 모티프 포함
const NoticeCard = () => (
  <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5 min-h-[220px] flex flex-col">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-md bg-ink-800 border border-line2/50 grid place-items-center text-brand-cyan">
        <Icon name="info" className="w-4 h-4" />
      </div>
      <div className="text-[14px] font-semibold tracking-tight">안내</div>
    </div>
    <div className="text-[13px] text-fg-dim leading-relaxed">
      분석 결과는 참고용 추정값이며<br/>실제 조성과 다를 수 있습니다.
    </div>
    <div className="mt-auto pt-3">
      <svg viewBox="0 0 280 60" className="w-full h-12 opacity-60">
        <defs>
          <linearGradient id="noticeWave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5EE6D6" stopOpacity="0.15"/>
            <stop offset="0.5" stopColor="#5EE6D6" stopOpacity="0.65"/>
            <stop offset="1" stopColor="#5EE6D6" stopOpacity="0.15"/>
          </linearGradient>
        </defs>
        <path d="M0 30 Q 35 5, 70 30 T 140 30 T 210 30 T 280 30" fill="none" stroke="url(#noticeWave)" strokeWidth="1.5"/>
        <path d="M0 35 Q 35 15, 70 35 T 140 35 T 210 35 T 280 35" fill="none" stroke="url(#noticeWave)" strokeWidth="1" opacity="0.6"/>
      </svg>
    </div>
  </div>
);

// === Loudness (dBFS) card — secondary metric below the big-number row ===
// state별로 빈/처리중/완료/오류 표현
const LoudnessCard = ({ state, progress = 0, peak = -1.4, rms = -14.8 }) => {
  // 시각화: -60..0 dBFS 스케일 위에 RMS 막대 + Peak 마커
  const scaleMin = -60, scaleMax = 0;
  const pct = (v) => Math.max(0, Math.min(100, ((v - scaleMin) / (scaleMax - scaleMin)) * 100));
  const ready = state === 'success';

  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-ink-800 border border-line2/50 grid place-items-center text-fg-dim">
            <Icon name="gauge" className="w-4 h-4" />
          </div>
          <div className="text-[14px] font-semibold tracking-tight">음량 (dBFS)</div>
          {ready && <Badge tone="ok"><Icon name="check" className="w-3 h-3"/>분석 완료</Badge>}
          {state === 'processing' && <Badge tone="cyan">분석 중…</Badge>}
          {state === 'error' && <Badge tone="err">실패</Badge>}
          {(state === 'empty' || state === 'uploaded') && <Badge tone="mute">대기</Badge>}
        </div>
        <div className="text-[11.5px] text-fg-mute">참고: 0 dBFS = 디지털 풀스케일</div>
      </div>

      {/* Two metrics side by side */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'peak', label: 'Peak', value: peak, hint: '구간 최대' },
          { key: 'rms',  label: 'RMS Avg', value: rms, hint: '평균 음량' },
        ].map(({key,label,value,hint}) => (
          <div key={key} className="rounded-xl bg-ink-800 border border-line2/50 px-4 py-3">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[11.5px] text-fg-mute">{label}</div>
              <div className={`num text-[22px] font-semibold tracking-tight ${ready ? 'text-fg' : 'text-fg-faint'}`}>
                {ready ? `${value.toFixed(1)} dB` : '— —'}
              </div>
            </div>
            {/* Meter scale */}
            <div className="relative h-2 rounded-full bg-ink-500/80 overflow-hidden">
              {/* gradient: green→yellow→red */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(90deg, rgba(63,207,142,0.25) 0%, rgba(242,181,68,0.35) 70%, rgba(244,110,122,0.5) 92%, rgba(244,110,122,0.85) 100%)'
              }}/>
              {ready && (
                <div className="absolute top-0 bottom-0 left-0 bg-brand-cyan/70 rounded-full" style={{ width: `${pct(value)}%` }}/>
              )}
              {state === 'processing' && (
                <div className="absolute top-0 bottom-0 left-0 bg-brand-cyan/40 animate-pulse rounded-full" style={{ width: `${Math.round(progress*100)}%` }}/>
              )}
            </div>
            <div className="flex justify-between text-[10.5px] text-fg-faint num mt-1.5">
              <span>-60</span><span>-30</span><span>0 dB</span>
            </div>
            <div className="text-[11px] text-fg-mute mt-2">{hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// === Per-step progress list (visible during processing OR on success as ✓ list) ===
const StepRow = ({ label, status, progress }) => {
  const tone =
    status === 'done'   ? 'text-ok' :
    status === 'active' ? 'text-brand-cyan' :
    status === 'error'  ? 'text-err' : 'text-fg-mute';
  const iconName =
    status === 'done'   ? 'circle-check' :
    status === 'active' ? 'analyze' :
    status === 'error'  ? 'error' : 'info';
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon name={iconName} className={`w-4 h-4 ${tone}`} />
      <div className={`text-[13px] flex-1 ${status === 'idle' ? 'text-fg-mute' : 'text-fg-dim'}`}>{label}</div>
      <div className="w-40 h-1.5 bg-ink-500 rounded-full overflow-hidden">
        <div
          className={`h-full ${status === 'done' ? 'bg-ok' : status === 'error' ? 'bg-err' : 'bg-brand-cyan'} ${status==='active' ? 'animate-pulse' : ''}`}
          style={{ width: `${Math.round((progress ?? 0) * 100)}%` }}
        />
      </div>
      <div className="w-10 num text-[11.5px] text-fg-mute text-right">
        {status === 'done' ? '100%' : `${Math.round((progress ?? 0)*100)}%`}
      </div>
    </div>
  );
};

const StepListCard = ({ state, steps }) => {
  const ready = state === 'success';
  const failed = state === 'error';
  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-ink-800 border border-line2/50 grid place-items-center text-fg-dim">
            <Icon name="list" className="w-4 h-4" />
          </div>
          <div className="text-[14px] font-semibold tracking-tight">분석 진행</div>
        </div>
        <div className="text-[11.5px] text-fg-mute num">
          {ready ? '4 / 4 단계 완료' : failed ? '중단됨' : state === 'processing' ? '진행 중' : '대기'}
        </div>
      </div>
      <div className="divide-y divide-line2/30">
        {steps.map(s => <StepRow key={s.label} {...s} />)}
      </div>
    </div>
  );
};

// === Bottom guidance / disclaimer strip ===
const FootNotice = ({ tone = 'warn', icon = 'warn', title, body }) => {
  const skin = tone === 'err'
    ? 'bg-err/8 border-err/35 text-err'
    : tone === 'ok'
      ? 'bg-ok/8 border-ok/35 text-ok'
      : 'bg-warn/8 border-warn/35 text-warn';
  return (
    <div className={`mt-5 rounded-2xl border ${skin} px-5 py-4 flex items-start gap-3.5`}>
      <div className="w-9 h-9 rounded-full bg-ink-800/60 border border-line2/40 grid place-items-center shrink-0">
        <Icon name={icon} className="w-4 h-4" />
      </div>
      <div className="leading-relaxed">
        <div className="text-[13.5px] font-medium">{title}</div>
        {body && <div className="text-[12.5px] text-fg-dim mt-0.5">{body}</div>}
      </div>
    </div>
  );
};

window.ActionBtn = ActionBtn;
window.RunBar = RunBar;
window.ResultBigCard = ResultBigCard;
window.NoticeCard = NoticeCard;
window.LoudnessCard = LoudnessCard;
window.StepListCard = StepListCard;
window.FootNotice = FootNotice;
