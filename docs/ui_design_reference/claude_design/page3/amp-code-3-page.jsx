// Section 5 - Part C: AmplifyPage container skeleton
const Sec5_Page = () => (
  <>
    <DocH3>5-3. AmplifyPage.tsx — 컨테이너 스켈레톤</DocH3>
    <Code>{`// pages/AmplifyPage.tsx
import { useState } from 'react';
import { useAudioFile } from '@/hooks/useAudioFile';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { useGainPreview } from '@/hooks/useGainPreview';
import { amplifyAudio } from '@/lib/audio/amplify';
import { ampResultFilename } from '@/lib/audio/filename';

export default function AmplifyPage() {
  const [pageState, setPageState] = useState<PageState>('empty');
  const [error, setError] = useState<string | null>(null);
  const { file, stats, peaks, upload, clear } = useAudioFile({
    accept: ['audio/mpeg'],
    maxBytes: 20 * 1024 * 1024,
    maxDurationSec: 600,
    onError: (msg) => { setError(msg); setPageState('error'); },
    onLoaded: () => setPageState('uploaded'),
  });
  const [settings, setSettings] = useState<AmpSettings>({ gainDb: 0, antiClip: true });
  const play = useAudioPlayback(file?.blob);
  const preview = useGainPreview(file?.blob, settings);
  const [result, setResult] = useState<AmpResult | null>(null);

  const v: AmpValidation = {
    hasFile: !!file,
    willClip: !!stats && (stats.rmsDbfs + settings.gainDb) > 0,
    overAmplified: settings.gainDb > 12,
  };
  const canRender = v.hasFile && pageState !== 'processing';

  async function onRender() {
    if (!file || !canRender) return;
    setPageState('processing');
    try {
      const r = await amplifyAudio(file, settings);
      setResult(r); setPageState('success');
    } catch (e: any) {
      setError(e.message); setPageState('error');
    }
  }

  return (
    <Layout>
      <Sidebar active="amp" />
      <Main>
        <PageHeader title="음량 증폭"
          desc="파형을 확인하면서 gain을 조절하고 결과를 저장할 수 있습니다." />
        <UploadFileCard state={pageState} file={file} onUpload={upload} onClear={clear} />
        <AmpWaveformCard
          state={pageState}
          duration={file?.durationSec ?? 0}
          peaks={peaks}
          gainDb={settings.gainDb}
          antiClip={settings.antiClip}
          playSec={play.currentSec}
          onSeek={play.seek}
        />
        <Row cols="1fr 470px">
          <GainSliderPanel
            gainDb={settings.gainDb}
            onChange={(v) => setSettings(s => ({...s, gainDb: v}))}
            antiClip={settings.antiClip}
            onAntiClipChange={(v) => setSettings(s => ({...s, antiClip: v}))}
            state={pageState}
          />
          <LevelMeterPanel
            origDb={stats?.rmsDbfs ?? -Infinity}
            gainDb={settings.gainDb}
            antiClip={settings.antiClip}
          />
        </Row>
        <AmpControlBar
          state={pageState}
          onPlayOrig={play.play}
          onPreviewResult={preview.play}
          onRender={onRender}
        />
        <Row cols="1fr 410px">
          <AmpResultCard state={pageState} file={file} result={result}
                         gainDb={settings.gainDb} antiClip={settings.antiClip}
                         error={error}/>
          <AmpGuidanceCard
            gainDb={settings.gainDb}
            antiClip={settings.antiClip}
            willClip={v.willClip}
          />
        </Row>
      </Main>
    </Layout>
  );
}`}</Code>
  </>
);
window.Sec5_Page = Sec5_Page;
