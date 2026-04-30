// Section 5 - Part E: design tokens
const Sec5_Tokens = () => (
  <>
    <DocH3>5-7. 디자인 토큰 (key 페이지에서 새로 사용)</DocH3>
    <Code>{`// styles/tokens.ts
export const key = {
  semiBig: 96,           // 큰 숫자 폰트 사이즈
  stepperSize: 56,       // −/+ 버튼
  sliderHeight: 6,
  sliderThumb: 20,
  predictedArrow: 24,    // → 아이콘
  miniWaveH: 64,
  miniWaveBars: 64,
};

export const colorsKey = {
  semiPos: '#16A34A',    // +n 일 때 강조 (선택 사용)
  semiNeg: '#DC2626',    // -n 일 때 강조
  semiZero: '#64748B',
};`}</Code>
  </>
);
window.Sec5_Tokens = Sec5_Tokens;
