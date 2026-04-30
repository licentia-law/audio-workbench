// Section 5 - Part C: KeyPage skeleton
const Sec5_Page = () => (
  <>
    <DocH3>5-3. KeyPage.tsx — 컨테이너 스켈레톤</DocH3>
    <Code>{`// pages/KeyPage.tsx
export default function KeyPage() {
  const [pageState, setPageState] = useState<KeyState>('empty');
  const [error, setError] = useState<string | null>(null);
  const { file, upload, clear } = useAudioFile({
    accept: ['audio/mpeg'],
    maxBytes: 20 * 1024 * 1024,
    maxDurationSec: 600,
    onError: m => { setError(m); setPageState('error'); },
    onLoaded: () => setPageState('uploaded'),
  });
  const analysis = useKeyAnalysis(file);
  const { semi, set, reset } = useKeyShift();
  const play = useAudioPlayback(file?.blob);
  const [result, setResult] = useState<KeyResult | null>(null);

  const v = {
    hasFile: !!file,
    inRange: semi >= -12 && semi <= 12,
    changed: semi !== 0,
  };
  const canConvert = v.hasFile && v.inRange && v.changed && pageState !== 'processing';

  const predicted = useMemo(
    () => transposeKey(analysis.rootIdx, analysis.mode, semi),
    [analysis, semi],
  );

  async function onConvert() {
    if (!file || !canConvert) return;
    setPageState('processing');
    try {
      const r = await keyShiftAudio(file, semi, predicted);
      setResult(r); setPageState('success');
    } catch (e: any) {
      setError(e.message); setPageState('error');
    }
  }

  return (
    <Layout>
      <Sidebar active="key" />
      <Main>
        <PageHeader title="Key 변환" desc="반음 단위로 키를 조절하고 결과를 저장할 수 있습니다." />
        <UploadFileCard state={pageState} file={file} onUpload={upload} onClear={clear} />
        <Grid cols="1fr 2fr" gap={20}>
          <OriginalInfoCard
            state={pageState}
            originalKey={analysis.display}
            originalBpm={analysis.bpm}
            unknown={analysis.rootIdx == null}
            onPlay={() => play.playFrom(0)}
          />
          <SemitoneControl state={pageState} semi={semi} onChange={(v) => set(v)} />
        </Grid>
        <Grid cols="1fr 410px" gap={20}>
          <PredictedResultCard
            state={pageState} semi={semi}
            originalKey={analysis.display}
            unknown={analysis.rootIdx == null}
          />
          <GuidanceCard unknown={analysis.rootIdx == null} />
        </Grid>
        <ActionBar state={pageState} semi={semi} onConvert={onConvert} onReset={reset} />
        <ConversionResultCard
          state={pageState} semi={semi} file={file}
          result={result} error={error}
          unknown={analysis.rootIdx == null}
        />
      </Main>
    </Layout>
  );
}`}</Code>
  </>
);
window.Sec5_Page = Sec5_Page;
