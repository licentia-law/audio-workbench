// Stems page main App — wires mock + spec doc + Tweaks state switcher

const STEM_FILE = {
  name: 'song.mp3',
  baseName: 'song',
  duration: '03:42',
  durSec: 222,
  size: '8.4 MB',
  type: 'MP3',
  sampleRate: '44.1 kHz',
  bitrate: '320 kbps',
};

const STEM_STATES = ['empty', 'uploaded', 'processing', 'success', 'error'];

const StemsApp = () => {
  const [tw, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "state": "success",
    "showSpec": true
  }/*EDITMODE-END*/);

  // 4 channel state
  const [channels, setChannels] = React.useState({
    vocals: { gainDb:  0.0, muted: false, solo: false, playing: false },
    drums:  { gainDb: -1.5, muted: false, solo: false, playing: false },
    bass:   { gainDb: -3.0, muted: false, solo: false, playing: false },
    other:  { gainDb: -2.2, muted: false, solo: false, playing: false },
  });
  const [masterDb, setMasterDb] = React.useState(-1.0);
  const [mixPlaying, setMixPlaying] = React.useState(false);

  const setCh = (id, patch) =>
    setChannels(s => ({ ...s, [id]: { ...s[id], ...patch } }));

  const isSuccess = tw.state === 'success';

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      {/* === MOCK FRAME === */}
      <div className="w-full bg-ink-900">
        <div className="frame-1440">
          <div className="flex min-h-[900px]">
            <StemSidebar active="stems" />
            <main className="flex-1 px-8 pt-7 pb-10">
              <StemPageHeader />

              <StemUploadCard state={tw.state} file={STEM_FILE} />

              {/* 4-channel mixer grid */}
              <div className="grid grid-cols-4 gap-4 mt-5">
                {STEMS.map(stem => {
                  const ch = channels[stem.id];
                  if (!isSuccess) {
                    return (
                      <div key={stem.id} className="rounded-2xl border border-dashed border-line2/60 bg-ink-700/40 p-4 min-h-[520px] flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: stem.glow, color: stem.color, opacity: 0.55 }}>
                            <StemIcon name={stem.icon} className="w-4 h-4"/>
                          </div>
                          <div>
                            <div className="text-[15px] font-semibold tracking-tight text-fg-mute">{stem.label}</div>
                            <div className="text-[10px] num tracking-[0.18em] font-semibold text-fg-faint">{stem.tag}</div>
                          </div>
                        </div>
                        <div className="flex-1 rounded-lg stripe border border-line2/40 grid place-items-center text-center px-4">
                          <div className="text-[12px] text-fg-mute leading-relaxed">
                            {tw.state === 'empty' && '파일을 업로드하면\n4개 채널이 표시됩니다.'}
                            {tw.state === 'uploaded' && '[스템 분리 실행]을\n눌러주세요.'}
                            {tw.state === 'processing' && (
                              <span className="inline-flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"/>
                                분리 중…
                              </span>
                            )}
                            {tw.state === 'error' && <span className="text-err">분리에 실패했습니다.</span>}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <StemChannel
                      key={stem.id}
                      stem={stem}
                      value={ch.gainDb}
                      muted={ch.muted}
                      solo={ch.solo}
                      playing={ch.playing}
                      fileBase={STEM_FILE.baseName}
                      onChange={(db) => setCh(stem.id, { gainDb: Math.max(-24, Math.min(12, db)) })}
                      onMute={() => setCh(stem.id, { muted: !ch.muted })}
                      onSolo={() => setCh(stem.id, { solo: !ch.solo })}
                      onTogglePlay={() => setCh(stem.id, { playing: !ch.playing })}
                    />
                  );
                })}
              </div>

              {/* Master panel */}
              <StemMasterPanel
                state={tw.state}
                fileBase={STEM_FILE.baseName}
                masterDb={masterDb}
                onMasterChange={setMasterDb}
                playing={mixPlaying}
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
                <div className="text-[11px] tracking-[0.2em] uppercase text-brand-cyan mb-2">Design spec · Stems page</div>
                <h1 className="text-[36px] font-semibold tracking-tight">Audio Adjuster — 5페이지 스템 분리 / 믹스 상세 시안</h1>
                <p className="text-fg-dim text-[14.5px] mt-3 leading-relaxed max-w-[720px]">
                  데스크톱 1440px 기준, React + Tailwind로 즉시 구현 가능한 수준의 상세 설계 문서다.
                  레이아웃 / 컴포넌트 / 상태 / 흐름 / 코드 스켈레톤 / 디자이너 정리 포인트 6개 섹션으로 구성된다.
                  위쪽 인터랙티브 시안은 우측 Tweaks 패널에서 5가지 상태(empty · uploaded · processing · success · error)를 전환하며 검증할 수 있다.
                </p>
              </div>

              <StemSpecDoc />
              <StemSec5 />
              <StemSec6_Designer />

              <div className="text-[12px] text-fg-mute pt-6 border-t border-line2/40 mt-10">
                © 2026 Audio Adjuster · Stems Page Spec v1.0
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
          <TweakToggle
            label="명세 문서 표시"
            value={tw.showSpec}
            onChange={(v) => setTweak('showSpec', v)}
          />
        </TweakSection>
        {isSuccess && (
          <TweakSection title="채널 페이더 (dB)">
            {STEMS.map(s => (
              <TweakSlider
                key={s.id}
                label={`${s.label} (${s.tag})`}
                value={channels[s.id].gainDb}
                min={-24} max={12} step={0.1}
                onChange={(v) => setCh(s.id, { gainDb: v })}
              />
            ))}
            <TweakSlider
              label="마스터"
              value={masterDb}
              min={-24} max={12} step={0.1}
              onChange={setMasterDb}
            />
          </TweakSection>
        )}
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<StemsApp />);
