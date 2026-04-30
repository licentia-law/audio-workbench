// === Amplify page main app ===
const { useState } = React;

const STATES = [
  { id: 'empty',      label: 'Empty (업로드 전)' },
  { id: 'uploaded',   label: 'Uploaded (조절 중)' },
  { id: 'processing', label: 'Processing (렌더링 중)' },
  { id: 'success',    label: 'Success (완료)' },
  { id: 'error',      label: 'Error (실패)' },
];

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "state": "uploaded",
  "gainDb": 6,
  "antiClip": true,
  "showTweaks": true
}/*EDITMODE-END*/;

function AmpApp() {
  const [tweaks, setTweak] = useTweaks(DEFAULTS);
  const state = tweaks.state;
  const gainDb = Number(tweaks.gainDb);
  const antiClip = !!tweaks.antiClip;

  // Mock file (uploaded 이후 표시)
  const file = state === 'empty' ? null : {
    name: 'song.mp3',
    baseName: 'song',
    sizeMB: 4.6,
    durationSec: 213, // 3:33
    sampleRate: 44100,
    bitrate: 192,
    rmsDbfs: -14.2,
    peakDbfs: -3.1,
  };

  return (
    <div className="min-h-screen bg-ink-900 text-fg">
      <div className="flex">
        <Sidebar active="amp" />
        <main className="flex-1 px-10 py-8 max-w-[1220px]">
          {/* 1. Page header */}
          <PageHeader
            kicker="Audio Adjuster"
            title="음량 증폭"
            desc="파형을 보면서 gain을 조절하고 결과를 저장합니다. -20 dB ~ +20 dB."
            state={state}
          />

          {/* 2. Upload + 파일 정보 */}
          <UploadFileCard state={state} file={file} />

          {/* 3. 파형 + dB scale */}
          <AmpWaveformCard
            state={state}
            file={file}
            gainDb={gainDb}
            antiClip={antiClip}
          />

          {/* 4. Gain 슬라이더 + 레벨 미터 */}
          <div className="grid grid-cols-[1fr_470px] gap-5 mt-5">
            <GainSliderPanel
              state={state}
              gainDb={gainDb}
              antiClip={antiClip}
              onGain={(v) => setTweak('gainDb', v)}
              onAntiClip={(v) => setTweak('antiClip', v)}
            />
            <LevelMeterPanel
              state={state}
              origDb={file?.rmsDbfs ?? -Infinity}
              gainDb={gainDb}
              antiClip={antiClip}
            />
          </div>

          {/* 5. 컨트롤 바 */}
          <AmpControlBar state={state} />

          {/* 6. 결과 카드 + 안내 */}
          <div className="grid grid-cols-[1fr_410px] gap-5 mt-5">
            <AmpResultCard
              state={state}
              file={file}
              gainDb={gainDb}
              antiClip={antiClip}
            />
            <AmpGuidanceCard
              state={state}
              gainDb={gainDb}
              antiClip={antiClip}
              willClip={file ? (file.rmsDbfs + gainDb) > 0 : false}
            />
          </div>

          {/* === 명세 문서 === */}
          <div className="mt-20 pt-10 border-t border-line2/50">
            <div className="mb-10">
              <div className="text-[12px] tracking-[0.18em] text-brand-cyan num uppercase mb-2">Spec · Page 4</div>
              <h1 className="text-[34px] font-semibold tracking-tight leading-tight mb-3">
                음량 증폭 — 디자인 시안 + 구현 명세
              </h1>
              <p className="text-[15px] text-fg-dim max-w-[720px] leading-relaxed">
                Trim 페이지(2-2.5)에서 정의한 카드/그리드/타이포 토큰을 그대로 이어받아,
                음량 증폭 페이지의 레이아웃·상태·인터랙션을 정의합니다. 코드 스켈레톤은
                React + TypeScript + WebAudio API 기준입니다.
              </p>
            </div>
            <SpecDoc />

            <DocSection n="05" id="code" title="코드 스켈레톤">
              <Sec5_FileTree />
              <Sec5_Types />
              <Sec5_Page />
              <Sec5_Hooks />
              <Sec5_Components />
            </DocSection>

            <SpecDoc2 />

            <div className="mt-16 pt-6 border-t border-line2/40 text-[12px] text-fg-faint flex items-center justify-between">
              <span>Audio Adjuster · Amplify spec v1.0</span>
              <span className="num">Page 4 / 5</span>
            </div>
          </div>
        </main>
      </div>

      <TweaksPanel title="Amplify · Tweaks">
        <TweakSection label="State">
          <TweakSelect
            label="Page state"
            value={state}
            options={STATES.map(s => ({ value: s.id, label: s.label }))}
            onChange={(v) => setTweak('state', v)}
          />
        </TweakSection>
        <TweakSection label="Gain">
          <TweakSlider
            label="Gain" min={-20} max={20} step={0.5}
            value={gainDb} unit=" dB"
            onChange={(v) => setTweak('gainDb', v)}
          />
          <TweakToggle
            label="Clipping 방지 (limiter)"
            checked={antiClip}
            onChange={(v) => setTweak('antiClip', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AmpApp />);
