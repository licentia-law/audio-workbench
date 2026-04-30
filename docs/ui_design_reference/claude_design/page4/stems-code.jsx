// Stems code skeletons + designer notes (concise version)
const StemSec5 = () => (
  <DocSection n="05" id="code" title="React/Tailwind 코드 스켈레톤">
    <DocH3>5-1. 파일 트리</DocH3>
    <Code>{`src/
  pages/
    StemMixPage.tsx
  components/
    stems/
      StemUploadCard.tsx
      StemChannel.tsx
      VerticalFader.tsx
      StemMiniWave.tsx
      StemMasterPanel.tsx
      StemNoticeCard.tsx
  hooks/
    useStemSeparation.ts        # POST /api/stems/separate + polling
    useStemMixer.ts             # 4 gain nodes + master gain (Web Audio)
    useStemPlayback.ts          # 4 audio elements 동기 재생
  lib/
    audio/stems.ts              # downloadStem, downloadMix
  types/
    stems.ts`}</Code>

    <DocH3>5-2. 타입</DocH3>
    <Code>{`export type StemId = 'vocals' | 'drums' | 'bass' | 'other';
export type PageState = 'empty'|'uploaded'|'processing'|'success'|'error';

export interface StemTrack {
  id: StemId;
  blob: Blob;
  url: string;
  peaks: number[];
  durationSec: number;
}

export interface ChannelState {
  gainDb: number;     // [-24, +12], -∞ when muted via UI? (use mute flag instead)
  muted: boolean;
  solo: boolean;
}

export interface MixerState {
  channels: Record<StemId, ChannelState>;
  masterDb: number;
  playing: boolean;
  positionSec: number;
}`}</Code>

    <DocH3>5-3. StemMixPage.tsx — 컨테이너</DocH3>
    <Code>{`export default function StemMixPage() {
  const [pageState, setPageState] = useState<PageState>('empty');
  const { file, upload, clear } = useAudioFile({ accept:['audio/mpeg'], maxBytes:20*1024*1024, maxDurationSec:600 });
  const sep = useStemSeparation();   // {tracks, progress, run, error}
  const mix = useStemMixer(sep.tracks);  // {state, setGain, setMute, setSolo, setMaster, play, pause}

  async function onSeparate() {
    if (!file) return;
    setPageState('processing');
    try { await sep.run(file); setPageState('success'); }
    catch (e) { setPageState('error'); }
  }

  return (
    <Layout>
      <StemSidebar active="stems"/>
      <Main>
        <StemPageHeader/>
        <StemUploadCard state={pageState} file={file} progress={sep.progress} onSeparate={onSeparate} onClear={clear}/>
        <MixerGrid>
          {STEMS.map(s => (
            <StemChannel key={s.id} stem={s}
              value={mix.state.channels[s.id].gainDb}
              muted={mix.state.channels[s.id].muted}
              solo={mix.state.channels[s.id].solo}
              playing={mix.state.playing}
              onChange={(db) => mix.setGain(s.id, db)}
              onMute={() => mix.setMute(s.id)}
              onSolo={() => mix.setSolo(s.id)}
              onTogglePlay={() => mix.togglePlay(s.id)}/>
          ))}
        </MixerGrid>
        <StemMasterPanel state={pageState} masterDb={mix.state.masterDb} onMasterChange={mix.setMaster}
          playing={mix.state.playing} onTogglePlay={mix.togglePlay}/>
        <StemNoticeCard state={pageState}/>
      </Main>
    </Layout>
  );
}`}</Code>

    <DocH3>5-4. useStemMixer.ts — Web Audio 핵심</DocH3>
    <Code>{`export function useStemMixer(tracks?: StemTrack[]) {
  const ctx = useMemo(() => new AudioContext(), []);
  const sourcesRef = useRef<Record<StemId, AudioBufferSourceNode>>({} as any);
  const gainsRef = useRef<Record<StemId, GainNode>>({} as any);
  const masterRef = useRef<GainNode | null>(null);

  // build graph when tracks ready
  useEffect(() => {
    if (!tracks) return;
    masterRef.current = ctx.createGain();
    masterRef.current.connect(ctx.destination);
    tracks.forEach(t => {
      const g = ctx.createGain();
      g.connect(masterRef.current!);
      gainsRef.current[t.id] = g;
    });
  }, [tracks]);

  const setGain = (id: StemId, db: number) => {
    const g = gainsRef.current[id];
    if (g) g.gain.setTargetAtTime(dbToGain(db), ctx.currentTime, 0.02);
  };
  const setMaster = (db: number) =>
    masterRef.current?.gain.setTargetAtTime(dbToGain(db), ctx.currentTime, 0.02);

  // play / pause / mute / solo … (생략)
}

const dbToGain = (db: number) => db <= -24 ? 0 : Math.pow(10, db / 20);`}</Code>

    <DocH3>5-5. lib/audio/stems.ts — 다운로드</DocH3>
    <Code>{`export async function downloadStem(file: AudioFile, stemId: StemId, blob: Blob) {
  saveAs(blob, \`\${baseName(file.name)}(\${stemId}).mp3\`);
}

// 현재 페이더/마스터 값으로 mp3 렌더 후 저장
export async function downloadMix(file: AudioFile, tracks: StemTrack[], mix: MixerState) {
  const fd = new FormData();
  fd.append('original', file.blob);
  tracks.forEach(t => fd.append(t.id, t.blob));
  fd.append('settings', JSON.stringify({
    channels: mix.channels, masterDb: mix.masterDb,
  }));
  const res = await fetch('/api/stems/mix', { method:'POST', body: fd });
  saveAs(await res.blob(), \`\${baseName(file.name)}(mixed).mp3\`);
}`}</Code>

    <DocH3>5-6. Tailwind 디자인 토큰 (page1과 동일)</DocH3>
    <Code>{`// 색상 / 폰트 / 카드 / 핸들 그림자는 page1 토큰을 그대로 사용한다.
// 채널 색상만 추가:
stem: {
  vocals: '#A78BFA',  // violet
  drums:  '#5EE6D6',  // brand cyan
  bass:   '#7C8CFF',  // brand indigo
  other:  '#F2B544',  // amber
}`}</Code>
  </DocSection>
);

const StemSec6_Designer = () => (
  <DocSection n="06" id="designer" title="디자이너 관점의 세부 정리 포인트">
    <DocH3>6-1. 시각 위계</DocH3>
    <DocList items={[
      "헤더 카드 → 4채널 믹서 → 마스터 패널 → 안내. 4채널 믹서가 페이지의 '메인 스테이지'로 가장 큰 면적을 차지한다.",
      "채널 4개에 각각 다른 색상을 부여해 어떤 stem을 조작 중인지 즉시 인지 가능하게 한다 (보컬=바이올렛, 드럼=cyan, 베이스=인디고, 그 외=앰버).",
      "마스터 패널은 '단일 풀폭 카드 + 3분할'로, 채널 카드와 시각적으로 구분되는 가로 형식을 사용해 위계를 분리.",
    ]}/>

    <DocH3>6-2. 채널 카드 디테일</DocH3>
    <DocList items={[
      "헤더 좌측: 컬러 칩 + 아이콘 + 한국어 라벨 + (작게) 영문 태그(VOCALS/DRUMS…). 한글 위주이지만 모노 영문 태그로 정보 밀도를 높인다.",
      "M(Mute) / S(Solo) 버튼은 헤더 우측에 28×28 아이콘 토글. M은 err 톤, S는 cyan 톤으로 의미 분리.",
      "미니 파형은 채널 색의 세로 그라디언트, 비활성/뮤트 시 회색조로 fade. 재생 진행도는 amber playhead(다른 페이지와 통일).",
      "세로 페이더는 트랙(36px) + 페이더 노브(28×16, 흰색 + 채널색 ring) + 0 dB tick. 우측에는 dB 스케일(+12/0/-12/-24/-∞)과 피크 메터를 같이 둔다.",
      "피크 메터는 단순 시각화: 페이더 위치 + 약간의 변동. >65% 앰버, >85% 레드로 클리핑 위험 가시화.",
      "다운로드 버튼은 outline + cyan 아이콘. 파일명을 모노로 한 줄 더 노출 (예: song(vocals).mp3).",
    ]}/>

    <DocH3>6-3. 마스터 패널 디테일</DocH3>
    <DocList items={[
      "좌측: 풀폭 mix 파형 + 재생 버튼. 재생 헤드 위치는 채널 카드와 동기화.",
      "중앙: 가로 슬라이더 (좌 -∞ → 우 +12). 0 dB 위치에 짧은 tick으로 단위 인지 보조.",
      "우측: Mixed 다운로드 (primary cyan) + 파일명 카드. Mixed는 페이지에서 가장 강한 1차 액션이므로 마스터 패널에 단독 배치.",
      "비-success 상태에서는 모든 컨트롤이 disabled 톤(ink-500 + fg-mute). 단, 레이아웃은 동일하게 유지해 시선 이동 최소화.",
    ]}/>

    <DocH3>6-4. 처리 시간 UX (1~2분)</DocH3>
    <DocList items={[
      "분리 실행 카드 하단에 progress bar + 예상 소요시간(\"1~2분 소요\")을 명시. 사용자는 시간이 오래 걸려도 페이지를 떠나지 않는다.",
      "백그라운드 처리 안내: \"다른 페이지로 이동해도 작업이 유지됩니다.\" 안내 카드에 노출.",
      "processing 동안 채널 그리드는 skeleton 상태 (회색 사선)로 채워두어 '결과가 들어올 자리'를 보여 둔다.",
    ]}/>

    <DocH3>6-5. 마이크로카피</DocH3>
    <SpecTable
      head={['상황','문구']}
      rows={[
        ['empty 채널 그리드','파일을 업로드하면 4개 채널이 이곳에 표시됩니다.'],
        ['uploaded 채널 그리드','[스템 분리 실행]을 눌러 4채널로 분리하세요.'],
        ['processing','분리 중… (Demucs 4-stem · 1~2분 소요)'],
        ['처리 실패','분리에 실패했습니다. 다른 mp3 파일로 다시 시도하거나 길이를 줄여보세요.'],
        ['품질 면책','스템 분리는 AI 기반 분석이며, 완벽한 분리가 보장되지는 않습니다.'],
      ]}
    />

    <DocH3>6-6. 접근성</DocH3>
    <DocList items={[
      "페이더에 role=\"slider\" + aria-valuemin/max/now/text(\"-1.2 dB\"). 위/아래 화살표로 0.1 dB 단위.",
      "Mute/Solo 토글에 aria-pressed. 색상만이 아니라 라벨(M/S)로도 식별.",
      "파일명 모노 텍스트는 dir=\"ltr\" 명시 (한글 라벨과 섞일 때 wrap 방지).",
    ]}/>
  </DocSection>
);

window.StemSec5 = StemSec5;
window.StemSec6_Designer = StemSec6_Designer;
