// Section 5 - Part E: tailwind tokens + waveform JSX outline
const Sec5_Tokens = () => (
  <>
    <DocH3>5-7. Tailwind 디자인 토큰</DocH3>
    <Code>{`// tailwind.config.ts (요약)
colors: {
  ink:   { 850:'#0B1020', 800:'#0F1428', 700:'#141A2E', 600:'#1A2138', 500:'#222B47' },
  line:  '#1F2742',
  fg:    { DEFAULT:'#E6ECFF', dim:'#A8B0CF', mute:'#6E769B' },
  brand: { cyan:'#5EE6D6', cyanDeep:'#2DBEAE', indigo:'#7C8CFF' },
  play:  '#FFB347',     // 재생 헤드 (대비 높은 강조색)
  ok:    '#3FCF8E',
  warn:  '#F2B544',
  err:   '#F46E7A',
},
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
},
borderRadius: { card: '16px', btn: '10px' },
spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32,
font scale:    11 / 12 / 13.5 / 14 / 16 / 20 / 28 / 36(num)`}</Code>

    <DocH3>5-8. WaveformCard.tsx — JSX 골격</DocH3>
    <Code>{`<div className="rounded-2xl border border-line bg-ink-700">
  {/* 1) 눈금자 */}
  <Ruler duration={duration} />

  {/* 2) 파형 */}
  <div className="relative h-[220px] px-4">
    <svg viewBox={\`0 0 \${peaks.length} 100\`} preserveAspectRatio="none">
      <g fill="url(#wfDim)">{peaks.map(...)}</g>
      <g fill="url(#wfHot)" clipPath="url(#selClip)">{peaks.map(...)}</g>
    </svg>

    {/* 3) 선택 영역 오버레이 */}
    <SelectionOverlay startSec={startSec} endSec={endSec} duration={duration} />

    {/* 4) 핸들 + 재생 헤드 */}
    <Handle side="start" sec={startSec} onDrag={s => onChange({startSec:s})} />
    <Handle side="end"   sec={endSec}   onDrag={s => onChange({endSec:s})} />
    <Playhead sec={playSec} duration={duration} onSeek={onSeek} />

    {/* 5) processing 오버레이 */}
    {state==='processing' && <ProgressOverlay value={62} />}
  </div>

  {/* 6) 툴바 */}
  <Toolbar onZoomIn={...} onZoomOut={...} volume={vol} />
</div>`}</Code>
  </>
);
window.Sec5_Tokens = Sec5_Tokens;
