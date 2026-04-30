// Section 5 - Part A: File tree for Key page
const Sec5_FileTree = () => (
  <>
    <DocH3>5-1. 파일 트리</DocH3>
    <Code>{`src/
  pages/
    KeyPage.tsx                 # 3페이지 컨테이너
  components/
    common/
      Sidebar.tsx
      PageHeader.tsx
      Badge.tsx
      ActionButton.tsx
      UploadDropzone.tsx
      FileMetaCard.tsx
    key/
      OriginalInfoCard.tsx      # 원본 Key/BPM + 원본 재생
      SemitoneControl.tsx       # 빅 넘버 + −/+ stepper + 슬라이더
      PredictedResultCard.tsx   # 원본 → 예상 Key + 템포
      GuidanceCard.tsx
      ConversionResultCard.tsx  # 결과 플레이어 + 다운로드
      ResultMiniWave.tsx
  hooks/
    useAudioFile.ts
    useKeyShift.ts              # semi 상태 + 검증
    useAudioPlayback.ts
  lib/
    audio/decode.ts
    audio/peaks.ts
    audio/keyShift.ts           # pitch shift (tempo preserve)
    audio/keyName.ts            # transposeKey + 파일명 정규화
  types/
    audio.ts                    # AudioFile, KeyState, KeyShift`}</Code>
  </>
);
window.Sec5_FileTree = Sec5_FileTree;
