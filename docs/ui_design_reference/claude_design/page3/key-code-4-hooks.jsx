// Section 5 - Part D: hooks (useKeyShift + keyShift lib + keyName util)
const Sec5_Hooks = () => (
  <>
    <DocH3>5-4. useKeyShift.ts</DocH3>
    <Code>{`// hooks/useKeyShift.ts
export function useKeyShift(initial = 0) {
  const [semi, setSemi] = useState<number>(initial);
  const set = (v: number) => setSemi(clamp(Math.round(v), -12, 12));
  const inc = () => set(semi + 1);
  const dec = () => set(semi - 1);
  const reset = () => setSemi(0);
  return { semi, set, inc, dec, reset };
}`}</Code>

    <DocH3>5-5. lib/audio/keyName.ts</DocH3>
    <Code>{`// lib/audio/keyName.ts
const SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

export function transposeKey(
  rootIdx: number | null, mode: 'Major'|'minor'|null, semi: number,
) {
  if (rootIdx == null || mode == null) return null;
  const idx = ((rootIdx + semi) % 12 + 12) % 12;
  const note = (semi < 0 ? FLAT : SHARP)[idx];
  return {
    display:  \`\${note} \${mode}\`,
    fileSafe: \`\${note.replace('#','_sharp').replace('b','_flat')}_\${mode}\`,
  };
}

export function buildKeyFilename(srcName: string, semi: number, k?: ReturnType<typeof transposeKey>) {
  const base = srcName.replace(/\\.mp3$/i, '');
  if (k) return \`\${base}(\${k.fileSafe}).mp3\`;
  const sign = semi >= 0 ? \`+\${semi}\` : \`\${semi}\`;
  return \`\${base}(key_shift_\${sign}).mp3\`;
}`}</Code>

    <DocH3>5-6. lib/audio/keyShift.ts</DocH3>
    <Code>{`// lib/audio/keyShift.ts
export async function keyShiftAudio(
  file: AudioFile, semi: number, predicted?: { display: string },
): Promise<KeyResult> {
  const fd = new FormData();
  fd.append('file', file.blob, file.name);
  fd.append('semi', String(semi));         // -12..+12
  fd.append('preserveTempo', 'true');
  const res = await fetch('/api/key-shift', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Key 변환 처리에 실패했습니다.');
  const blob = await res.blob();
  return {
    blob,
    filename: buildKeyFilename(file.name, semi, predictedToK(predicted)),
    targetKey: predicted?.display ?? 'Unknown',
    semi,
    durationSec: file.durationSec,
  };
}`}</Code>
  </>
);
window.Sec5_Hooks = Sec5_Hooks;
