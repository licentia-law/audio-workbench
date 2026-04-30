// Section 5 - Part D: hooks + amp lib
const Sec5_Hooks = () => (
  <>
    <DocH3>5-4. useGainPreview.ts (실시간 미리듣기)</DocH3>
    <Code>{`// hooks/useGainPreview.ts
// WebAudio GainNode를 사용해 렌더 없이 즉시 적용 결과를 들려준다.
export function useGainPreview(blob: Blob | undefined, settings: AmpSettings) {
  const ctx = useRef<AudioContext | null>(null);
  const buf = useRef<AudioBuffer | null>(null);
  const src = useRef<AudioBufferSourceNode | null>(null);
  const gain = useRef<GainNode | null>(null);
  const limiter = useRef<DynamicsCompressorNode | null>(null);

  useEffect(() => {
    if (!blob) return;
    const ac = new AudioContext();
    ctx.current = ac;
    blob.arrayBuffer().then(b => ac.decodeAudioData(b)).then(b => { buf.current = b; });
    return () => { ac.close(); };
  }, [blob]);

  useEffect(() => {
    if (!gain.current) return;
    gain.current.gain.value = Math.pow(10, settings.gainDb / 20);
  }, [settings.gainDb]);

  return {
    play: () => {
      const ac = ctx.current; const b = buf.current;
      if (!ac || !b) return;
      src.current?.stop();
      const s = ac.createBufferSource(); s.buffer = b;
      const g = ac.createGain();
      g.gain.value = Math.pow(10, settings.gainDb / 20);
      s.connect(g);
      let last: AudioNode = g;
      if (settings.antiClip) {
        const l = ac.createDynamicsCompressor();
        l.threshold.value = -0.5; l.ratio.value = 20; l.attack.value = 0; l.release.value = 0.1;
        g.connect(l); last = l;
      }
      last.connect(ac.destination);
      s.start(); src.current = s; gain.current = g;
    },
    stop: () => { src.current?.stop(); src.current = null; },
  };
}`}</Code>

    <DocH3>5-5. lib/audio/amplify.ts</DocH3>
    <Code>{`// lib/audio/amplify.ts
export async function amplifyAudio(
  file: AudioFile,
  settings: AmpSettings
): Promise<AmpResult> {
  const fd = new FormData();
  fd.append('file', file.blob, file.name);
  fd.append('gain_db', String(settings.gainDb));
  fd.append('anti_clip', settings.antiClip ? '1' : '0');
  const res = await fetch('/api/amplify', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('음량 증폭 처리에 실패했습니다.');
  const blob = await res.blob();
  return {
    blob,
    filename: ampResultFilename(file.baseName, settings.gainDb),
    durationSec: file.durationSec,
    sizeBytes: blob.size,
    stats: await readStatsHeader(res),
  };
}

// lib/audio/filename.ts
export function ampResultFilename(base: string, gainDb: number): string {
  const sign = gainDb >= 0 ? '+' : '';
  // 0.0 → "0dB", 6.0 → "+6dB", 4.5 → "+4.5dB"
  const num = Number.isInteger(gainDb) ? gainDb.toFixed(0) : gainDb.toFixed(1);
  return \`\${base}(\${sign}\${num}dB).mp3\`;
}`}</Code>

    <DocH3>5-6. lib/audio/dbfs.ts</DocH3>
    <Code>{`// lib/audio/dbfs.ts
// 디코딩된 PCM에서 RMS dBFS와 Peak dBFS 계산
export function computeStats(buf: AudioBuffer): AudioStats {
  let sumSq = 0, count = 0, peak = 0;
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      sumSq += v * v;
      const a = Math.abs(v);
      if (a > peak) peak = a;
      count++;
    }
  }
  const rms = Math.sqrt(sumSq / count) || 1e-12;
  return {
    rmsDbfs: 20 * Math.log10(rms),
    peakDbfs: 20 * Math.log10(peak || 1e-12),
  };
}`}</Code>
  </>
);
window.Sec5_Hooks = Sec5_Hooks;
