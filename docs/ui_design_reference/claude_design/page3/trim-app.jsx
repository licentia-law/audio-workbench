// Main app — wires the visible mock + spec doc + Tweaks state switcher

const FILE = {
  name: 'song.mp3',
  duration: '03:42',
  durSec: 222,
  size: '8.4 MB',
  type: 'MP3',
  sampleRate: '44.1 kHz',
  bitrate: '320 kbps',
  cutName: 'song(cut).mp3',
};

const STATES = ['empty', 'uploaded', 'processing', 'success', 'error'];

const App = () => {
  const [tw, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "state": "uploaded",
    "showSpec": true
  }/*EDITMODE-END*/);

  const [sel, setSel] = React.useState({
    startSec: 45.32,
    endSec: 168.91,
    playSec: 94.20,
  });
  const onChange = (patch) => setSel(s => ({...s, ...patch}));

  const valid = {
    order:  sel.startSec < sel.endSec,
    minLen: (sel.endSec - sel.startSec) >= 1.0,
  };

  const isEmpty = tw.state === 'empty';
  const len = Math.max(0, sel.endSec - sel.startSec);

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      {/* === MOCK FRAME === */}
      <div className="w-full bg-ink-900">
        <div className="frame-1440">
          <div className="flex min-h-[900px]">
            <Sidebar active="trim" />
            <main className="flex-1 px-8 pt-7 pb-10">
              <PageHeader />

              {/* Upload + meta card */}
              <UploadFileCard state={tw.state} file={FILE} />

              {/* Waveform — gets margin-top */}
              <div className="mt-5">
                <WaveformCard
                  state={tw.state}
                  duration={FILE.durSec}
                  startSec={sel.startSec}
                  endSec={sel.endSec}
                  playSec={sel.playSec}
                  onChange={onChange}
                />
              </div>

              <SelectionInfo
                start={isEmpty ? 0 : sel.startSec}
                end={isEmpty ? 0 : sel.endSec}
                total={FILE.durSec}
              />
              <ControlBar state={tw.state} />

              <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: '1fr 410px' }}>
                <ResultCard state={tw.state} file={FILE} len={len} />
                <GuidanceCard state={tw.state} valid={valid} />
              </div>
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
                <div className="text-[11px] tracking-[0.2em] uppercase text-brand-cyan mb-2">Design spec · Trim page</div>
                <h1 className="text-[36px] font-semibold tracking-tight">Audio Adjuster — 1페이지 음원 자르기 상세 시안</h1>
                <p className="text-fg-dim text-[14.5px] mt-3 leading-relaxed max-w-[720px]">
                  데스크톱 1440px 기준, React + Tailwind로 즉시 구현 가능한 수준의 상세 설계 문서다.
                  레이아웃 / 컴포넌트 / 상태 / 흐름 / 코드 스켈레톤 / 디자이너 정리 포인트 6개 섹션으로 구성된다.
                  위쪽 인터랙티브 시안은 우측 Tweaks 패널에서 5가지 상태(empty · uploaded · processing · success · error)를 전환하며 검증할 수 있다.
                </p>
              </div>

              <SpecDoc />
              <Sec5 />
              <Sec6_Designer />

              <div className="text-[12px] text-fg-mute pt-6 border-t border-line2/40 mt-10">
                © 2026 Audio Adjuster · Trim Page Spec v1.0
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
            options={STATES.map(s => ({ value: s, label: s }))}
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
        <TweakSection title="시작 / 종료 (드래그 가능)">
          <TweakSlider label="시작 (s)" value={sel.startSec} min={0} max={FILE.durSec} step={0.01}
            onChange={(v) => setSel(s => ({...s, startSec: Math.min(v, s.endSec - 1)}))} />
          <TweakSlider label="종료 (s)" value={sel.endSec} min={0} max={FILE.durSec} step={0.01}
            onChange={(v) => setSel(s => ({...s, endSec: Math.max(v, s.startSec + 1)}))} />
          <TweakSlider label="재생 헤드 (s)" value={sel.playSec} min={0} max={FILE.durSec} step={0.01}
            onChange={(v) => setSel(s => ({...s, playSec: v}))} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
