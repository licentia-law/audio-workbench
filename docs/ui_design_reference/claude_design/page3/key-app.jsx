// === Key page — top-level app & tweaks ===
const { useState, useMemo, useEffect } = React;

const TWEAKS = /*EDITMODE-BEGIN*/{
  "state": "uploaded",
  "semi": 3,
  "originalKey": "A minor",
  "originalRootIdx": 9,
  "originalMode": "minor",
  "originalBpm": 128,
  "unknown": false,
  "showSpec": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = (typeof useTweaks === 'function')
    ? useTweaks(TWEAKS)
    : (() => {
        const [s, setS] = useState(TWEAKS);
        const set = (k, v) => {
          if (typeof k === 'object' && k !== null) setS(prev => ({ ...prev, ...k }));
          else setS(prev => ({ ...prev, [k]: v }));
        };
        return [s, set];
      })();

  const state = t.state;
  const semi  = t.semi;
  const setSemi = (v) => setTweak('semi', Math.max(-12, Math.min(12, v)));

  // Predicted key for header micro-summary
  const predicted = useMemo(
    () => transposeKey(t.unknown ? null : t.originalRootIdx, t.originalMode, semi),
    [t.unknown, t.originalRootIdx, t.originalMode, semi],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowLeft')  { setSemi(semi - (e.shiftKey ? 5 : 1)); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setSemi(semi + (e.shiftKey ? 5 : 1)); e.preventDefault(); }
      if (e.key === '0' && !e.metaKey && !e.ctrlKey) { setSemi(0); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [semi]);

  const StateChip = ({ id, label }) => (
    <button
      onClick={() => setTweak('state', id)}
      className={`h-7 px-2.5 rounded-md text-[11.5px] num border ${
        state === id
          ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/40'
          : 'bg-ink-700 text-fg-dim border-line2 hover:bg-ink-600'
      }`}>{label}</button>
  );

  return (
    <div className="min-h-screen pb-24">
      {/* MOCK FRAME ================================================== */}
      <section className="frame-1440 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2 text-[12px] text-fg-mute">
            <span className="num text-brand-cyan">/01</span>
            <span>최종 화면 (1440 × auto)</span>
            <span className="text-fg-faint">·</span>
            <span>5단계 상태를 클릭으로 전환하세요</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StateChip id="empty"      label="empty" />
            <StateChip id="uploaded"   label="uploaded" />
            <StateChip id="processing" label="processing" />
            <StateChip id="success"    label="success" />
            <StateChip id="error"      label="error" />
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-line2/60 bg-ink-900 shadow-card">
          <div className="flex">
            <Sidebar active="key" />
            <main className="flex-1 px-10 py-8">
              <PageHeader />

              <UploadFileCard state={state} />

              <div className="grid mt-5" style={{ gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <OriginalInfoCard
                  state={state}
                  originalKey={t.originalKey}
                  originalBpm={t.originalBpm}
                  unknown={t.unknown}
                />
                <SemitoneControl state={state} semi={semi} onChange={setSemi} />
              </div>

              <div className="grid mt-5" style={{ gridTemplateColumns: '1fr 410px', gap: '20px' }}>
                <PredictedResultCard
                  state={state} semi={semi}
                  originalKey={t.originalKey}
                  unknown={t.unknown}
                />
                <GuidanceCard unknown={t.unknown} />
              </div>

              <div className="mt-5">
                <ActionBar
                  state={state}
                  semi={semi}
                  onConvert={() => setTweak('state', 'processing')}
                  onReset={() => setSemi(0)}
                />
              </div>

              <ConversionResultCard
                state={state} semi={semi}
                file={FILE_DEFAULT}
                unknown={t.unknown}
              />
            </main>
          </div>
        </div>
      </section>

      {/* SPEC DOC =================================================== */}
      {t.showSpec && (
        <section className="frame-1440 mt-12">
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2 text-[12px] text-fg-mute">
              <span className="num text-brand-cyan">/02</span>
              <span>설계 문서 — 레이아웃 / 컴포넌트 / 상태 / 흐름 / 코드 골격</span>
            </div>
            <button
              onClick={() => setTweak('showSpec', false)}
              className="h-7 px-2.5 rounded-md text-[11.5px] border border-line2 text-fg-dim hover:text-fg hover:bg-ink-700">
              문서 접기
            </button>
          </div>
          <div className="rounded-2xl border border-line2/60 bg-ink-850 doc-bg">
            <div className="px-10 py-9 max-w-[1100px]">
              <SpecDoc />

              <DocSection n="05" id="code" title="구현 가이드 — 파일 / 타입 / 페이지 / 훅 / 토큰">
                <Sec5_FileTree />
                <Sec5_Types />
                <Sec5_Page />
                <Sec5_Hooks />
                <Sec5_Tokens />
              </DocSection>

              <Sec6_Notes />

              <div className="text-[11px] text-fg-faint pt-4 border-t border-line2/50 num">
                Audio Adjuster · Key 페이지 시안 v1 · 1440px 기준
              </div>
            </div>
          </div>
        </section>
      )}

      {!t.showSpec && (
        <div className="frame-1440 mt-8">
          <button
            onClick={() => setTweak('showSpec', true)}
            className="h-9 px-3 rounded-md border border-line2 text-fg-dim hover:text-fg hover:bg-ink-700 text-[12.5px]">
            설계 문서 펼치기
          </button>
        </div>
      )}

      {/* TWEAKS PANEL =============================================== */}
      {window.TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="페이지 상태">
            <TweakRadio
              value={state}
              onChange={(v) => setTweak('state', v)}
              options={[
                { value: 'empty',      label: 'empty' },
                { value: 'uploaded',   label: 'uploaded' },
                { value: 'processing', label: 'processing' },
                { value: 'success',    label: 'success' },
                { value: 'error',      label: 'error' },
              ]}
            />
          </TweakSection>

          <TweakSection title="Semitone">
            <TweakSlider
              min={-12} max={12} step={1}
              value={semi}
              onChange={(v) => setTweak('semi', v)}
              suffix=" semi"
            />
            <div className="flex items-center gap-2 pt-1">
              <TweakButton onClick={() => setTweak('semi', -7)}>-7</TweakButton>
              <TweakButton onClick={() => setTweak('semi', -3)}>-3</TweakButton>
              <TweakButton onClick={() => setTweak('semi', 0)}>0</TweakButton>
              <TweakButton onClick={() => setTweak('semi', 3)}>+3</TweakButton>
              <TweakButton onClick={() => setTweak('semi', 7)}>+7</TweakButton>
            </div>
          </TweakSection>

          <TweakSection title="원본 분석값">
            <TweakToggle
              label="Key 분석 실패 (Unknown)"
              value={t.unknown}
              onChange={(v) => setTweak('unknown', v)}
            />
            <TweakSelect
              label="원본 Key"
              value={`${t.originalRootIdx}|${t.originalMode}`}
              onChange={(v) => {
                const [idx, mode] = v.split('|');
                const root = parseInt(idx, 10);
                const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
                setTweak({
                  originalRootIdx: root,
                  originalMode: mode,
                  originalKey: `${NOTES[root]} ${mode}`,
                });
              }}
              options={[
                { value: '0|Major',  label: 'C Major' },
                { value: '7|Major',  label: 'G Major' },
                { value: '5|Major',  label: 'F Major' },
                { value: '9|minor',  label: 'A minor' },
                { value: '4|minor',  label: 'E minor' },
                { value: '2|minor',  label: 'D minor' },
              ]}
            />
            <TweakSlider
              label="원본 BPM"
              min={60} max={200} step={1}
              value={t.originalBpm}
              onChange={(v) => setTweak('originalBpm', v)}
            />
          </TweakSection>

          <TweakSection title="문서">
            <TweakToggle
              label="설계 문서 표시"
              value={t.showSpec}
              onChange={(v) => setTweak('showSpec', v)}
            />
          </TweakSection>

          {predicted && (
            <div className="text-[11px] text-fg-mute num pt-1">
              미리보기 → <span className="text-brand-cyan">{predicted.display}</span>
            </div>
          )}
        </TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
