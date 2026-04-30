import { useProcessingPage } from '../../hooks/useProcessingPage'
import { ProcessingPageShell } from '../../components/layout/ProcessingPageShell'
import { InfoMessageCard } from '../../components/feedback/InfoMessageCard'

export function KeyShiftPage() {
  const page = useProcessingPage(async (_file) => {
    // P4에서 Rubber Band CLI 기반 Key 변환 로직 구현 예정
    await new Promise<void>((resolve) => setTimeout(resolve, 1200))
  })

  return (
    <ProcessingPageShell
      title="Key 변환"
      description="음원의 키(조성)를 반음 단위로 올리거나 내립니다."
      processLabel="변환 시작"
      processingLabel="변환 중..."
      successContent={
        <InfoMessageCard type="info" message="P4에서 Key 변환 결과 파일이 여기에 표시됩니다." />
      }
      {...page}
    />
  )
}
