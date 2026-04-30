// Main app for Stems / Mix page — wires mock + spec + Tweaks state switcher

const STEM_FILE = {
  name: 'song.mp3',
  duration: '03:42',
  durSec: 222,
  size: '8.4 MB',
  type: 'MP3',
  sampleRate: '44.1 kHz',
  bitrate: '320 kbps',
  base: 'song',
};

const STEM_STATES = ['empty', 'uploaded', 'processing', 'success', 'error'];

const StemApp = () => {
  const [tw, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "state": "success",
    "showSpec": true
  }/*EDITMODE-END*/);

  // per-channel state
  const [channels, setChannels] = React.useState({
    vocals: { gainDb:  0.0, muted: false, solo: false, playing: false },
    drums:  { gainDb: -2.0, muted: false, solo: false, playing: false },
    bass:   { gainDb:  1.5, muted: false, solo: false, playing: false },
    other:  { gainDb: -4.0, muted: true,  solo: false, playing: false },
  });

  const [masterDb, setMasterDb] = React.useState(-1.0);
  const [mixPlaying, setMixPlaying] = React.useState(true);

  const setCh = (id, patch) => setChannels(c => ({ ...c, [id]: { ...c[id], ...patch } }));

  // when state is not success, force everything inactive visually
  const ready = tw.state === 'success';
  const effectiveChannels = ready ? channels : Object.fromEntries(STEMS.map(s => [s.id, { gainDb: 0, muted: true, solo: false, playing: false }]));

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      {/* === MOCK FRAME === */}
      <div className="w-full bg-ink-900">
        <div className="frame-1440">
          <div className="flex min-h-[900px]">
            <StemSidebar active="stems" />
            <main className="flex-1 px-8 pt-7 pb-10">
              <StemPageHeader />

              {/* Upload + meta + 분리 실행 */}
              <StemUploadCard state={tw.state} file={STEM_FILE} />

              {/* 4-channel mixer grid */}
              <div className="mt-5">
                {ready ? (
                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                    {STEMS.map(s => (
                      <StemChannel
                        key={s.id}
                        stem={s}
                        value={effectiveChannels[s.id].gainDb}
                        muted={effectiveChannels[s.id].muted}
                        solo={effectiveChannels[s.id].solo}
                        playing={effectiveChannels[s.id].playing}
                        fileBase={STEM_FILE.base}
                        onChange={(db) => setCh(s.id, { gainDb: db })}
                        onMute={() => setCh(s.id, { muted: !channels[s.id].muted })}
                        onSolo={() => setCh(s.id, { solo: !channels[s.id].solo })}
                        onTogglePlay={() => setCh(s.id, { playing: !channels[s.id].playing })}
                      />
                    ))}
                  </div>
                ) : (
                  <StemMixerPlaceholder state={tw.state} />
                )}
              </div>

              {/* Master panel */}
              <StemMasterPanel
                state={tw.state}
                fileBase={STEM_FILE.base}
                masterDb={masterDb}
                onMasterChange={setMasterDb}
                playing={mixPlaying && ready}
                onTogglePlay={() => setMixPlaying(p => !p)}
              />

              {/* Notice */}
              <StemNoticeCard state={tw.state} />
            </main>
          </div>
        </div>
      </div>

      {/* === SPEC DOC === */}
      {tw.showSpec && (
        <div className="border-t border-line2/60 doc-bg">
          <div className="frame-1440 px-8 py-14">
            <div className="max-w-[980px]">
              <div className="mb-10">
                <div className="text-[11px] tracking-[0.2em] uppercase text-brand-cyan mb-2">Design spec · Stems / Mix page</div>
                <h1 className="text-[36px] font-semibold tracking-tight">Audio Adjuster — 5페이지 스템 분리 / 믹스 상세 시안</h1>
                <p className="text-fg-dim text-[14.5px] mt-3 leading-relaxed max-w-[760px]">
                  데스크톱 1440px 기준, React + Tailwind로 즉시 구현 가능한 수준의 상세 설계 문서입니다.
                  레이아웃 / 컴포넌트 / 상태 / 흐름 / 코드 스켈레톤 / 디자이너 정리 포인트 6개 섹션으로 구성됩니다.
                  위쪽 인터랙티브 시안은 우측 Tweaks 패널에서 5가지 상태(empty · uploaded · processing · success · error)를 전환하며 검증할 수 있습니다.
                </p>
              </div>

              <StemSpecDoc />
              <StemSec5 />
              <StemSec6_Designer />

              <div className="text-[12px] text-fg-mute pt-6 border-t border-line2/40 mt-10">
                © 2026 Audio Adjuster · Stems / Mix Page Spec v1.0
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === TWEAKS PANEL === */}
      <TweaksPanel title="Tweaks" defaultOpen={false}>
        <TweakSection title="페이지 상태">
          <TweakRadio
            value={tw.state}
            options={STEM_STATES.map(s => ({ value: s, label: s }))}
            onChange={(v) => setTweak('state', v)}
          />
        </TweakSection>
        <TweakSection title="문서">
          <TweakToggle label="명세 문서 표시" value={tw.showSpec} onChange={(v) => setTweak('showSpec', v)} />
        </TweakSection>
        <TweakSection title="채널 음량 (dB)">
          {STEMS.map(s => (
            <TweakSlider
              key={s.id}
              label={`${s.label}`}
              value={channels[s.id].gainDb}
              min={-24} max={12} step={0.1}
              onChange={(v) => setCh(s.id, { gainDb: v })}
            />
          ))}
          <TweakSlider label="마스터" value={masterDb} min={-24} max={12} step={0.1} onChange={setMasterDb} />
        </TweakSection>
        <TweakSection title="재생">
          <TweakToggle label="전체 Mix 재생 중" value={mixPlaying} onChange={setMixPlaying} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

// Placeholder shown when state !== success
const StemMixerPlaceholder = ({ state }) => {
  const message = {
    empty:      '파일을 업로드하면 4개 채널이 이곳에 표시됩니다.',
    uploaded:   '[스템 분리 실행]을 눌러 4채널로 분리하세요.',
    processing: '분리 중… (Demucs 4-stem · 1~2분 소요)',
    error:      '분리에 실패했습니다. 다시 시도해 주세요.',
  }[state] || '';

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
      {STEMS.map(s => (
        <div key={s.id} className="rounded-2xl border border-line bg-ink-700/60 p-4 min-h-[520px] flex flex-col">
          <div className="flex items-center gap-2 mb-3 opacity-50">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: s.glow, color: s.color }}>
              <StemIcon name={s.icon} className="w-4 h-4"/>
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-tight">{s.label}</div>
              <div className="text-[10px] num tracking-[0.18em] font-semibold" style={{ color: s.color }}>{s.tag}</div>
            </div>
          </div>
          <div className={`flex-1 rounded-lg stripe border border-line2/40 grid place-items-center text-center px-4 ${state==='processing' ? 'animate-pulse' : ''}`}>
            <div className="text-[12px] text-fg-mute leading-relaxed">{message}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<StemApp />);
