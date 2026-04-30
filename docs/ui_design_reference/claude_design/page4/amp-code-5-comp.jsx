// Section 5 - Part E: GainSliderPanel + LevelMeterPanel components
const Sec5_Components = () => (
  <>
    <DocH3>5-7. GainSliderPanel.tsx</DocH3>
    <Code>{`// components/amp/GainSliderPanel.tsx
interface Props {
  gainDb: number;                 // -20 ~ +20
  onChange: (v: number) => void;
  antiClip: boolean;
  onAntiClipChange: (v: boolean) => void;
  state: PageState;
}
export function GainSliderPanel({ gainDb, onChange, antiClip, onAntiClipChange, state }: Props) {
  const disabled = state === 'empty' || state === 'processing';
  const sign = gainDb >= 0 ? '+' : '';
  const display = \`\${sign}\${gainDb.toFixed(1)} dB\`;

  // 스냅 포인트: -20, -10, 0, +10, +20
  const ticks = [-20, -10, 0, 10, 20];

  return (
    <Card title="Gain" subtitle="−20 dB ~ +20 dB · 0.5 dB 단위 · Shift 키로 0.1 dB">
      <div className="big-number">{display}</div>
      <Slider
        min={-20} max={20} step={0.5}
        value={gainDb}
        onChange={onChange}
        disabled={disabled}
        ticks={ticks}
        markers={[
          { at: 0,   label: '0' },
          { at: 6,   label: '+6 (2배)' },
          { at: 12,  label: '+12' },
          { at: -6,  label: '-6' },
        ]}
      />
      <Toggle
        label="Clipping 방지 (limiter -0.5 dBFS)"
        checked={antiClip}
        onChange={onAntiClipChange}
        disabled={disabled}
      />
    </Card>
  );
}`}</Code>

    <DocH3>5-8. LevelMeterPanel.tsx</DocH3>
    <Code>{`// components/amp/LevelMeterPanel.tsx
interface Props {
  origDb: number;       // 원본 RMS dBFS
  gainDb: number;
  antiClip: boolean;
}
export function LevelMeterPanel({ origDb, gainDb, antiClip }: Props) {
  const expected = origDb + gainDb;
  const clipped  = antiClip ? Math.min(expected, -0.5) : expected;
  const willClip = expected > 0;

  return (
    <Card title="레벨 미터" subtitle="RMS dBFS 기준">
      <Meter label="원본"    db={origDb}  range={[-40, 0]} />
      <Meter label="결과(예상)" db={clipped} range={[-40, 0]}
             warn={willClip && !antiClip} />
      {willClip && !antiClip && (
        <Hint kind="warn">
          예상 레벨이 0 dBFS를 넘어 클리핑이 발생합니다. Clipping 방지를 켜거나 gain을 낮추세요.
        </Hint>
      )}
      {willClip && antiClip && (
        <Hint kind="info">
          limiter가 -0.5 dBFS에서 신호를 잘라내 클리핑을 방지합니다.
        </Hint>
      )}
    </Card>
  );
}`}</Code>
  </>
);
window.Sec5_Components = Sec5_Components;
