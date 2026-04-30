// Section 5 - Part D: hooks (selection + playback + trim lib)
const Sec5_Hooks = () => (
  <>
    <DocH3>5-4. useTrimSelection.ts</DocH3>
    <Code>{`// hooks/useTrimSelection.ts
export function useTrimSelection(durationSec: number) {
  const [startSec, setStart] = useState(0);
  const [endSec,   setEnd]   = useState(durationSec);
  const [playSec,  setPlay]  = useState(0);

  useEffect(() => { setEnd(durationSec); }, [durationSec]);

  const set = (patch: Partial<TrimSelection>) => {
    if (patch.startSec != null)
      setStart(clamp(patch.startSec, 0, endSec - 0.05));
    if (patch.endSec != null)
      setEnd(clamp(patch.endSec, startSec + 0.05, durationSec));
    if (patch.playSec != null)
      setPlay(clamp(patch.playSec, 0, durationSec));
  };
  return { startSec, endSec, playSec, set };
}`}</Code>

    <DocH3>5-5. useAudioPlayback.ts</DocH3>
    <Code>{`// hooks/useAudioPlayback.ts
export function useAudioPlayback(blob?: Blob) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [currentSec, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stopAt = useRef<number | null>(null);

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = new Audio(url);
    ref.current = a;
    a.ontimeupdate = () => {
      setCurrent(a.currentTime);
      if (stopAt.current != null && a.currentTime >= stopAt.current) {
        a.pause(); setPlaying(false); stopAt.current = null;
      }
    };
    a.onpause = () => setPlaying(false);
    a.onplay  = () => setPlaying(true);
    return () => { a.pause(); URL.revokeObjectURL(url); };
  }, [blob]);

  return {
    currentSec, playing,
    playFrom: (from: number, until?: number) => {
      const a = ref.current; if (!a) return;
      a.currentTime = from;
      stopAt.current = until ?? null;
      a.play();
    },
    stop: () => { ref.current?.pause(); stopAt.current = null; },
    seek: (t: number) => { if (ref.current) ref.current.currentTime = t; },
  };
}`}</Code>

    <DocH3>5-6. lib/audio/trim.ts</DocH3>
    <Code>{`// lib/audio/trim.ts
// 로컬 백엔드 또는 ffmpeg.wasm 호출 래퍼
export async function trimAudio(
  file: AudioFile, startSec: number, endSec: number
): Promise<TrimResult> {
  const fd = new FormData();
  fd.append('file', file.blob, file.name);
  fd.append('start', String(startSec));
  fd.append('end',   String(endSec));
  const res = await fetch('/api/trim', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('자르기 처리에 실패했습니다.');
  const blob = await res.blob();
  return {
    blob,
    filename: file.name.replace(/\\.mp3$/i, '') + '(cut).mp3',
    durationSec: endSec - startSec,
    sizeBytes: blob.size,
  };
}`}</Code>
  </>
);
window.Sec5_Hooks = Sec5_Hooks;
