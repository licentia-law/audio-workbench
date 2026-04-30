// Section 5 wrapper — combines all 5-* sub-parts under one DocSection
const Sec5 = () => (
  <DocSection n="05" id="code" title="React/Tailwind 코드 스켈레톤">
    <DocP>아래는 1페이지 음원 자르기를 그대로 구현 가능한 수준의 골격이다. 타입은 TS 기준이지만 JS로도 그대로 옮길 수 있다.</DocP>
    <Sec5_FileTree />
    <Sec5_Types />
    <Sec5_Page />
    <Sec5_Hooks />
    <Sec5_Tokens />
  </DocSection>
);
window.Sec5 = Sec5;
