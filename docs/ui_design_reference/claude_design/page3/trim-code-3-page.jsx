// Section 5 - Part C: TrimPage container skeleton
const Sec5_Page = () => (
  <>
    <DocH3>5-3. TrimPage.tsx — 컨테이너 스켈레톤</DocH3>
    <Code>{`// pages/TrimPage.tsx
import { useState } from 'react';
import { useAudioFile } from '@/hooks/useAudioFile';
import { useTrimSelection } from '@/hooks/useTrimSelection';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { trimAudio } from '@/lib/audio/trim';

export default function TrimPage() {
  const [pageState, setPageState] = useState<PageState>('empty');
  const [error, setError] = useState<string | null>(null);
  const { file, peaks, upload, clear } = useAudioFile({
    accept: ['audio/mpeg'],
    maxBytes: 20 * 1024 * 1024,
    maxDurationSec: 600,
    onError: (msg) => { setError(msg); setPageState('error'); },
    onLoaded: () => setPageState('uploaded'),
  });
  const sel = useTrimSelection(file?.durationSec ?? 0);
  const play = useAudioPlayback(file?.blob);
  const [result, setResult] = useState<TrimResult | null>(null);

  const v = {
    hasFile: !!file,
    order:   sel.startSec < sel.endSec,
    minLen:  sel.endSec - sel.startSec >= 1.0,
  };
  const canCut = v.hasFile && v.order && v.minLen && pageState !== 'processing';

  async function onCut() {
    if (!file || !canCut) return;
    setPageState('processing');
    try {
      const r = await trimAudio(file, sel.startSec, sel.endSec);
      setResult(r); setPageState('success');
    } catch (e: any) {
      setError(e.message); setPageState('error');
    }
  }

  return (
    <Layout>
      <Sidebar active="trim" />
      <Main>
        <PageHeader title="음원 자르기" desc="원하는 구간만 선택하여 잘라낼 수 있습니다." />
        <UploadFileCard state={pageState} file={file} onUpload={upload} onClear={clear} />
        <WaveformCard
          state={pageState}
          duration={file?.durationSec ?? 0}
          peaks={peaks}
          startSec={sel.startSec} endSec={sel.endSec} playSec={play.currentSec}
          onChange={sel.set}
          onSeek={play.seek}
        />
        <SelectionInfo start={sel.startSec} end={sel.endSec} total={file?.durationSec ?? 0} />
        <ControlBar
          state={pageState} canCut={canCut}
          onPlay={() => play.playFrom(sel.startSec)}
          onStop={play.stop}
          onPreviewStart={() => play.playFrom(sel.startSec)}
          onPreviewEnd={() => play.playFrom(Math.max(0, sel.endSec - 5), sel.endSec)}
          onCut={onCut}
        />
        <Row>
          <ResultCard state={pageState} result={result} error={error} />
          <GuidanceCard valid={v} />
        </Row>
      </Main>
    </Layout>
  );
}`}</Code>
  </>
);
window.Sec5_Page = Sec5_Page;
