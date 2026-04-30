// Stem-page header components: Sidebar (active=stems), PageHeader, UploadFileCard, ProgressBar

const StemSidebar = ({ active = 'stems' }) => {
  const items = [
    { id: 'trim',    label: '음원 자르기',  icon: 'scissors' },
    { id: 'analyze', label: '음원 분석',    icon: 'analyze' },
    { id: 'key',     label: 'Key 변환',     icon: 'key' },
    { id: 'amp',     label: '음량 증폭',    icon: 'volume' },
    { id: 'stems',   label: '스템 분리 / 믹스', icon: 'stems' },
  ];
  return (
    <aside className="w-[220px] shrink-0 border-r border-line bg-ink-850 flex flex-col">
      <div className="px-5 pt-6 pb-7 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-brand-cyan/15 border border-brand-cyan/30 grid place-items-center text-brand-cyan">
          <Icon name="logo" className="w-4 h-4" />
        </div>
        <div className="font-semibold tracking-tight">Audio Adjuster</div>
      </div>
      <nav className="px-3 flex flex-col gap-0.5">
        {items.map(it => {
          const on = it.id === active;
          return (
            <a key={it.id} className={`flex items-center gap-3 px-3 h-10 rounded-md text-[13.5px] ${on ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20' : 'text-fg-dim hover:text-fg hover:bg-ink-700/60 border border-transparent'}`}>
              <Icon name={it.icon} className="w-4 h-4" />
              <span>{it.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="mt-auto px-3 pb-5 flex flex-col gap-0.5">
        <a className="flex items-center gap-3 px-3 h-9 rounded-md text-[13px] text-fg-mute hover:text-fg-dim"><Icon name="info" className="w-4 h-4" />이용 가이드</a>
        <a className="flex items-center gap-3 px-3 h-9 rounded-md text-[13px] text-fg-mute hover:text-fg-dim"><Icon name="cog" className="w-4 h-4" />설정</a>
        <a className="flex items-center gap-3 px-3 h-9 rounded-md text-[13px] text-fg-mute hover:text-fg-dim"><Icon name="support" className="w-4 h-4" />문의하기</a>
        <div className="px-3 pt-3 text-[11px] text-fg-faint">© 2026 Audio Adjuster</div>
      </div>
    </aside>
  );
};

const StemPageHeader = () => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">스템 분리 / 믹스</h1>
      <p className="text-fg-dim text-[14px] mt-1.5">mp3를 4개 stem으로 분리하고 음량을 조절해 mixed 결과를 저장할 수 있습니다.</p>
    </div>
    <button className="h-9 px-3 inline-flex items-center gap-2 rounded-md border border-line2 text-fg-dim hover:text-fg hover:bg-ink-700 text-[13px]">
      <Icon name="help" className="w-4 h-4" />이용 가이드
    </button>
  </div>
);

// Upload + meta + 분리 실행 (top card)
const StemUploadCard = ({ state, file }) => {
  const uploaded = state !== 'empty';
  const sepRunning = state === 'processing';
  const sepDone = state === 'success';
  return (
    <div className="rounded-2xl border border-line bg-ink-700 shadow-card p-5">
      <div className="grid items-stretch" style={{ gridTemplateColumns: '380px 1fr 280px' }}>
        {/* Drop zone */}
        <div className={`relative rounded-xl border ${uploaded ? 'border-line2 border-dashed' : 'border-dashed border-brand-cyan/40 bg-brand-cyan/5'} px-5 py-5 flex flex-col items-center justify-center text-center min-h-[150px]`}>
          <div className={`w-9 h-9 rounded-full grid place-items-center mb-2 ${uploaded ? 'bg-ink-600 text-fg-mute' : 'bg-brand-cyan/15 text-brand-cyan'}`}>
            <Icon name="upload" className="w-4 h-4" />
          </div>
          <div className="text-[13px] text-fg">오디오 파일을 드래그&드롭 하세요</div>
          <div className="text-[11.5px] text-fg-mute my-1">또는</div>
          <button className="px-3.5 h-8 rounded-md bg-brand-cyan text-ink-900 text-[12.5px] font-semibold hover:bg-brand-cyan/90">파일 선택</button>
          <div className="text-[11px] text-fg-mute mt-2.5">지원 형식: MP3 · 최대 10분 · 20MB</div>
        </div>

        {/* Meta */}
        <div className="pl-6 pr-6 flex items-center">
          {!uploaded ? (
            <div className="w-full text-fg-mute text-[13px] flex items-center gap-2">
              <Icon name="info" className="w-4 h-4" />업로드된 파일이 없습니다.
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-12 rounded-md bg-gradient-to-b from-ink-500 to-ink-600 border border-line2 grid place-items-center">
                  <span className="num text-[10px] text-brand-cyan font-semibold">MP3</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className="text-[16px] font-semibold tracking-tight">{file.name}</div>
                    {sepDone && <Badge tone="ok"><Icon name="check" className="w-3 h-3" />분리 완료</Badge>}
                    {sepRunning && <Badge tone="cyan">분리 중…</Badge>}
                    {state === 'uploaded' && <Badge tone="ok"><Icon name="check" className="w-3 h-3" />업로드 완료</Badge>}
                    {state === 'error' && <Badge tone="err">분리 실패</Badge>}
                  </div>
                  <div className="text-[12px] text-fg-mute mt-0.5">방금 업로드됨</div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {[
                  ['길이', file.duration],
                  ['크기', file.size],
                  ['형식', file.type],
                  ['샘플레이트', file.sampleRate],
                  ['비트레이트', file.bitrate],
                ].map(([k,v]) => (
                  <div key={k} className="rounded-lg bg-ink-800 border border-line2/50 px-3 py-2">
                    <div className="text-[11px] text-fg-mute">{k}</div>
                    <div className="text-[13.5px] font-medium num mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action column */}
        <div className="flex flex-col items-stretch justify-center gap-2 border-l border-line2/40 pl-5">
          <button
            disabled={!uploaded || sepRunning}
            className={[
              'h-12 px-4 rounded-lg inline-flex items-center justify-center gap-2 text-[13.5px] font-semibold border',
              !uploaded || sepRunning
                ? 'bg-ink-500 text-fg-mute border-line2 cursor-not-allowed'
                : 'bg-brand-cyan text-ink-900 border-brand-cyan hover:bg-brand-cyan/90',
            ].join(' ')}>
            <Icon name="scissors" className="w-4 h-4" />
            {sepRunning ? '분리 중…' : sepDone ? '다시 분리' : '스템 분리 실행'}
          </button>
          <button
            disabled={!uploaded}
            className="h-9 rounded-md border border-line2 text-fg-dim hover:text-err hover:border-err/50 inline-flex items-center justify-center gap-2 text-[12.5px] disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon name="trash" className="w-3.5 h-3.5" /> 파일 제거
          </button>
        </div>
      </div>

      {/* Separation progress row */}
      {(sepRunning || sepDone || state === 'error') && (
        <div className="mt-4 pt-4 border-t border-line2/40 flex items-center gap-4">
          <div className="text-[12px] text-fg-mute shrink-0 w-[88px]">분리 진행 상태</div>
          <div className="flex-1 h-2 bg-ink-500 rounded-full overflow-hidden">
            <div
              className={`h-full ${state==='error' ? 'bg-err' : 'bg-brand-cyan'} ${sepRunning ? 'animate-pulse' : ''}`}
              style={{ width: sepRunning ? '64%' : sepDone ? '100%' : '32%' }} />
          </div>
          <div className="num text-[12px] w-[60px] text-right">
            {sepRunning ? '64%' : sepDone ? '100%' : state==='error' ? '오류' : '0%'}
          </div>
          {sepDone && <Badge tone="ok"><Icon name="check" className="w-3 h-3"/>분리 완료</Badge>}
          {sepRunning && (
            <span className="text-[11.5px] text-fg-mute">예상 소요 1~2분 · Demucs 4-stem</span>
          )}
          {state === 'error' && <Badge tone="err">분리 실패</Badge>}
        </div>
      )}
    </div>
  );
};

window.StemSidebar = StemSidebar;
window.StemPageHeader = StemPageHeader;
window.StemUploadCard = StemUploadCard;
