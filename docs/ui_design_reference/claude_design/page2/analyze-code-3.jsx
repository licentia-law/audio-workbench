// === Spec doc — Section 5-5: tokens ===
const Sec5_Tokens = () => (
  <>
    <DocH3>5-5. Tailwind 디자인 토큰 (page1과 동일 — 변경 없음)</DocH3>
    <Code>{`// tailwind.config.ts (요약, page1 Trim과 100% 공유)
colors: {
  ink:   { 900:'#070B18', 850:'#0B1020', 800:'#0F1428',
           700:'#141A2E', 600:'#1A2138', 500:'#222B47' },
  line:  '#1F2742', line2: '#2A3354',
  fg:    { DEFAULT:'#E6ECFF', dim:'#A8B0CF', mute:'#6E769B', faint:'#4A5377' },
  brand: { cyan:'#5EE6D6', cyanDeep:'#2DBEAE', indigo:'#7C8CFF' },
  ok:    '#3FCF8E',
  warn:  '#F2B544',  // Unknown 톤 — 분석 페이지 핵심 사용처
  err:   '#F46E7A',
},
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
},
borderRadius: { card: '16px', btn: '10px' },
font scale:    11 / 12 / 13.5 / 14 / 16 / 20 / 22(num) / 28 / 40 / 64(num)`}</Code>

    <DocP>page1 음원 자르기와 토큰을 100% 공유하므로 별도 추가 정의 없음.
    단, <b className="text-fg">font scale에 64px(num)</b>를 추가해 Key/BPM 빅 넘버를 표현한다 (Unknown 시 40px로 축소).</DocP>
  </>
);

const Sec5 = () => (
  <DocSection n="05" id="code" title="React/Tailwind 코드 스켈레톤">
    <DocP>아래는 2페이지 음원 분석을 그대로 구현 가능한 수준의 골격이다. 1페이지와 hooks(<code className="num text-fg">useAudioFile</code>, <code className="num text-fg">useAudioPlayback</code>)를 공유한다.</DocP>
    <Sec5_Tree />
    <Sec5_Types />
    <Sec5_Page />
    <Sec5_Hooks />
    <Sec5_Tokens />
  </DocSection>
);

const SpecDoc = () => (
  <div className="text-fg">
    <Sec1_Layout />
    <Sec2_Components />
    <Sec3_States />
    <Sec4_Flows />
    <Sec5 />
  </div>
);

window.Sec5_Tokens = Sec5_Tokens;
window.Sec5 = Sec5;
window.SpecDoc = SpecDoc;
