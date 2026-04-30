// === Spec doc — Section 5-3: AnalyzePage ===
const Sec5_Page = () => (
  <>
    <DocH3>5-3. AnalyzePage.tsx — 컨테이너 스켈레톤</DocH3>
    <Code>{`// pages/AnalyzePage.tsx
import { useState } from 'react';
import { useAudioFile } from '@/hooks/useAudioFile';
import { useAnalysisJob } from '@/hooks/useAnalysisJob';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';

export default function AnalyzePage() {
  const [pageState, setPageState] = useState<PageState>('empty');
  const [error, setError] = useState<string | null>(null);

  const { file, upload, clear } = useAudioFile({
    accept: ['audio/mpeg'],
    maxBytes: 20 * 1024 * 1024,
    maxDurationSec: 600,
    onError:  (msg) => { setError(msg); setPageState('error'); },
    onLoaded: () => setPageState('uploaded'),
  });

  const play = useAudioPlayback(file?.blob);
  const job = useAnalysisJob(file);   // { steps, result, run() }

  async function onRun() {
    if (!file) return;
    setPageState('processing');
    try {
      await job.run();   // updates job.steps in place
      const allUnknown = job.result.key.unknown && job.result.bpm.unknown;
      setPageState(allUnknown ? 'error' : 'success');
    } catch (e: any) {
      setError(e.message);
      setPageState('error');
    }
  }

  return (
    <Layout>
      <Sidebar active="analyze" />
      <Main>
        <PageHeader title="음원 분석" desc="업로드한 음원의 Key와 BPM을 참고용으로 분석합니다." />
        <UploadFileCard state={pageState} file={file} onUpload={upload} onClear={clear} />
        <RunBar state={pageState} onPlay={play.play} onStop={play.stop} onRun={onRun} />

        <Row3>
          <ResultBigCard {...keyProps(job.result, pageState, job.progress.key)} />
          <ResultBigCard {...bpmProps(job.result, pageState, job.progress.bpm)} />
          <NoticeCard />
        </Row3>

        <Row2>
          <LoudnessCard state={pageState} {...job.result?.loudness} progress={job.progress.loudness} />
          <StepListCard state={pageState} steps={job.steps} />
        </Row2>

        {pageState === 'error' && (
          <FootNotice tone="err" icon="error"
            title="음원 분석에 실패했습니다."
            body="다른 mp3 파일로 다시 시도해 주세요." />
        )}
      </Main>
    </Layout>
  );
}`}</Code>
  </>
);

// === Spec doc — Section 5-4: useAnalysisJob ===
const Sec5_Hooks = () => (
  <>
    <DocH3>5-4. useAnalysisJob.ts</DocH3>
    <Code>{`// hooks/useAnalysisJob.ts — 5단계 분석 잡 상태머신
const STEPS: { key: StepKey; label: string; weight: number; fn: any }[] = [
  { key: 'decode',   label: '디코딩',          weight: 0.10, fn: decodeAudio },
  { key: 'peaks',    label: '피크 추출',        weight: 0.20, fn: extractPeaks },
  { key: 'key',      label: 'Key 추정 (chroma)',weight: 0.40, fn: detectKey },
  { key: 'bpm',      label: 'BPM 추정 (onset)', weight: 0.25, fn: detectBpm },
  { key: 'loudness', label: '음량 (RMS / Peak)', weight: 0.05, fn: measureLoudness },
];

export function useAnalysisJob(file?: AudioFile) {
  const [steps, setSteps] = useState<AnalysisStep[]>(() => idleSteps());
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function run() {
    if (!file) return;
    let ctx: any = { blob: file.blob };
    for (const s of STEPS) {
      mark(s.key, 'active', 0);
      try {
        ctx = await s.fn(ctx, (p: number) => mark(s.key, 'active', p));
        mark(s.key, 'done', 1);
      } catch (e) {
        mark(s.key, 'error', 0);
        // 부분 실패 허용: key/bpm은 Unknown으로 fall through
        if (s.key === 'key')  ctx.keyResult = { unknown: true, pretty: 'Unknown' };
        if (s.key === 'bpm')  ctx.bpmResult = { unknown: true, bpm: null };
        if (s.key === 'decode' || s.key === 'peaks') throw e;
      }
    }
    setResult({
      key: ctx.keyResult, bpm: ctx.bpmResult,
      loudness: ctx.loudness, durationSec: ctx.duration,
      analyzedAt: Date.now(),
    });
  }
  return { steps, result, run };
}`}</Code>
  </>
);

window.Sec5_Page = Sec5_Page;
window.Sec5_Hooks = Sec5_Hooks;
