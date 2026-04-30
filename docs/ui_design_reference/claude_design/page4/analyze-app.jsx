// Main app — wires the visible mock + spec doc + Tweaks state switcher

const FILE = {
  name: 'song.mp3',
  duration: '03:42',
  durSec: 222,
  size: '8.4 MB',
  type: 'MP3',
  sampleRate: '44.1 kHz',
  bitrate: '320 kbps',
};

const STATES = ['empty', 'uploaded', 'processing', 'success', 'error'];

const stepsForState = (state, prog) => {
  // prog: 0..1 overall progress for processing
  const STEPS = [
    { label: '디코딩',           weight: 0.10 },
    { label: '피크 추출',         weight: 0.20 },
    { label: 'Key 추정 (chroma)', weight: 0.40 },
    { label: 'BPM 추정 (onset)',  weight: 0.25 },
    { label: '음량 (RMS / Peak)',  weight: 0.05 },
  ];
  if (state === 'success') {
    return STEPS.map(s => ({ ...s, status: 'done', progress: 1 }));
  }
  if (state === 'error') {
    // 디코딩까지는 성공, Key에서 실패 가정
    return STEPS.map((s, i) => ({
      ...s,
      status: i < 2 ? 'done' : i === 2 ? 'error' : 'idle',
      progress: i < 2 ? 1 : 0,
    }));
  }
  if (state === 'processing') {
    // prog를 단계별로 분배
    let acc = 0;
    return STEPS.map(s => {
      const start = acc; const end = acc + s.weight; acc = end;
      let status = 'idle', p = 0;
      if (prog >= end) { status = 'done'; p = 1; }
      else if (prog > start) { status = 'active'; p = (prog - start) / s.weight; }
      return { ...s, status, progress: p };
    });
  }
  // empty / uploaded
  return STEPS.map(s => ({ ...s, status: 'idle', progress: 0 }));
};

const App = () => {
  const [tw, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "state": "success",
    "showSpec": true,
    "progress": 0.62,
    "unknownKey": false,
    "unknownBpm": false
  }/*EDITMODE-END*/);

  const isEmpty = tw.state === 'empty';
  const isProc  = tw.state === 'processing';
  const isOk    = tw.state === 'success';

  const steps = stepsForState(tw.state, tw.progress);

  // Key/BPM resolved values
  const keyValue = tw.unknownKey ? 'Unknown' : 'A minor';
  const bpmValue = tw.unknownBpm ? 'Unknown' : '128';

  // Per-card progress derived from overall progress
  const keyProg = Math.max(0, Math.min(1, (tw.progress - 0.30) / 0.40));
  const bpmProg = Math.max(0, Math.min(1, (tw.progress - 0.70) / 0.25));
  const loudProg = Math.max(0, Math.min(1, (tw.progress - 0.95) / 0.05));

  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      {/* === MOCK FRAME === */}
      <div className="w-full bg-ink-900">
        <div className="frame-1440">
          <div className="flex min-h-[900px]">
            <Sidebar active="analyze" />
            <main className="flex-1 px-8 pt-7 pb-10">
              <PageHeader />

              <UploadFileCard state={tw.state} file={FILE} />

              <RunBar state={tw.state} />

              {/* 3-column results: Key / BPM / Notice */}
              <div className="grid grid-cols-3 gap-5 mt-5">
                <ResultBigCard
                  icon="key"
                  title="Key"
                  state={tw.state}
                  value={keyValue}
                  caption="조성"
                  captionSub={tw.unknownKey ? '신뢰도 낮음' : 'A 마이너'}
                  progress={isProc ? keyProg : 0}
                  unknown={tw.unknownKey && isOk}
                />
                <ResultBigCard
                  icon="metronome"
                  title="BPM"
                  state={tw.state}
                  value={bpmValue}
                  unit={tw.unknownBpm ? '' : 'BPM'}
                  caption="템포"
                  captionSub="Beats Per Minute"
                  progress={isProc ? bpmProg : 0}
                  unknown={tw.unknownBpm && isOk}
                />
                <NoticeCard />
              </div>

              {/* dBFS + step list */}
              <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <LoudnessCard
                  state={tw.state}
                  progress={isProc ? loudProg : 0}
                  peak={-1.4}
                  rms={-14.8}
                />
                <StepListCard state={tw.state} steps={steps} />
              </div>

              {/* Bottom disclaimer / error notice */}
              {tw.state === 'error' && (
                <FootNotice
                  tone="err"
                  icon="error"
                  title="음원 분석에 실패했습니다."
                  body="네트워크 또는 디코더 오류일 수 있습니다. 다른 mp3 파일로 다시 시도해 주세요."
                />
              )}
              {tw.state === 'success' && (tw.unknownKey || tw.unknownBpm) && (
                <FootNotice
                  tone="warn"
                  icon="warn"
                  title="분석 실패 시 Unknown으로 표시될 수 있습니다."
                  body="조성/템포 추정 신뢰도가 낮으면 해당 값만 Unknown으로 표시됩니다. 다시 시도해 주세요."
                />
              )}
              {(tw.state === 'empty' || tw.state === 'uploaded' || (tw.state === 'success' && !tw.unknownKey && !tw.unknownBpm) || tw.state === 'processing') && (
                <FootNotice
                  tone="warn"
                  icon="warn"
                  title="분석 실패 시 Unknown으로 표시될 수 있습니다."
                  body="결과는 참고용 추정값이며 실제 조성과 다를 수 있습니다."
                />
              )}
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
                <div className="text-[11px] tracking-[0.2em] uppercase text-brand-cyan mb-2">Design spec · Analyze page</div>
                <h1 className="text-[36px] font-semibold tracking-tight">Audio Adjuster — 2페이지 음원 분석 상세 시안</h1>
                <p className="text-fg-dim text-[14.5px] mt-3 leading-relaxed max-w-[720px]">
                  데스크톱 1440px 기준, React + Tailwind로 즉시 구현 가능한 수준의 상세 설계 문서다.
                  1페이지(자르기)와 동일한 디자인 토큰·사이드바·업로드 카드·배지 시스템을 그대로 계승하며,
                  Key/BPM 빅 넘버 카드 + 음량(dBFS) 게이지 + 5단계 분석 진행 카드를 추가한 결과 카드 중심 페이지다.
                  위쪽 인터랙티브 시안은 우측 Tweaks 패널에서 5가지 상태(empty · uploaded · processing · success · error)와
                  Unknown 토글, 진행률 슬라이더로 검증할 수 있다.
                </p>
              </div>

              <SpecDoc />
              <Sec6_Designer />

              <div className="text-[12px] text-fg-mute pt-6 border-t border-line2/40 mt-10">
                © 2026 Audio Adjuster · Analyze Page Spec v1.0
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
        <TweakSection title="처리 중 진행률 (processing 상태에서만 반영)">
          <TweakSlider label="overall progress" value={tw.progress} min={0} max={1} step={0.01}
            onChange={(v) => setTweak('progress', v)} />
        </TweakSection>
        <TweakSection title="부분 Unknown (success 상태에서만)">
          <TweakToggle label="Key 결과를 Unknown으로" value={tw.unknownKey} onChange={(v) => setTweak('unknownKey', v)} />
          <TweakToggle label="BPM 결과를 Unknown으로" value={tw.unknownBpm} onChange={(v) => setTweak('unknownBpm', v)} />
        </TweakSection>
        <TweakSection title="문서">
          <TweakToggle label="명세 문서 표시" value={tw.showSpec} onChange={(v) => setTweak('showSpec', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
