// Section 5 - Part A: File tree
const Sec5_FileTree = () => (
  <>
    <DocH3>5-1. 파일 트리</DocH3>
    <Code>{`src/
  pages/
    TrimPage.tsx                # 1페이지 컨테이너 (상태 + 흐름)
  components/
    common/
      Sidebar.tsx
      PageHeader.tsx
      Badge.tsx
      ActionButton.tsx
      FileMetaCard.tsx
      UploadDropzone.tsx
    trim/
      WaveformCard.tsx          # 파형 + 핸들 + 재생 헤드
      WaveformHandle.tsx
      Playhead.tsx
      SelectionInfo.tsx
      ControlBar.tsx
      ResultCard.tsx
      GuidanceCard.tsx
  hooks/
    useAudioFile.ts             # 업로드/검증/디코딩
    useWaveformData.ts          # peaks 추출
    useAudioPlayback.ts         # play/pause/seek/onEnded
    useTrimSelection.ts         # start/end/검증
  lib/
    audio/decode.ts
    audio/peaks.ts
    audio/trim.ts               # ffmpeg.wasm 또는 백엔드 호출
    format.ts                   # fmt(seconds) 등
  types/
    audio.ts                    # AudioFile, TrimSelection, PageState`}</Code>
  </>
);
window.Sec5_FileTree = Sec5_FileTree;
