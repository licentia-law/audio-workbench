// Section 5 - Part A: file tree
const Sec5_FileTree = () => (
  <>
    <DocH3>5-1. 파일 트리</DocH3>
    <Code>{`src/
  pages/
    AmplifyPage.tsx              # 4페이지 컨테이너
  components/
    common/
      Sidebar.tsx
      PageHeader.tsx
      Badge.tsx
      ActionButton.tsx
      UploadDropzone.tsx
      FileMetaCard.tsx
    amp/
      AmpWaveformCard.tsx        # 파형 + dB grid + 재생 헤드
      GainSliderPanel.tsx        # -20~+20 dB + Clipping 방지 토글
      LevelMeterPanel.tsx        # 원본 / 결과(예상) RMS LED 메터
      AmpControlBar.tsx          # 원본 재생 / 결과 미리듣기 / 렌더링
      AmpResultCard.tsx          # song(+6dB).mp3 미리듣기 + 다운로드
      AmpGuidanceCard.tsx        # 실시간 경고 체크리스트
  hooks/
    useAudioFile.ts              # 업로드/검증/디코딩
    useWaveformData.ts           # peaks + RMS
    useAudioPlayback.ts          # play/pause/seek
    useGainPreview.ts            # WebAudio GainNode 실시간 반영
  lib/
    audio/decode.ts
    audio/peaks.ts
    audio/amplify.ts             # 백엔드 호출 (ffmpeg)
    audio/dbfs.ts                # RMS dBFS 계산
    format.ts
  types/
    audio.ts                     # AudioFile, AmpSettings, AmpResult, PageState`}</Code>
  </>
);
window.Sec5_FileTree = Sec5_FileTree;
