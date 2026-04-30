import { useProcessingPage } from '../../hooks/useProcessingPage'
import { ProcessingPageShell } from '../../components/layout/ProcessingPageShell'
import { InfoMessageCard } from '../../components/feedback/InfoMessageCard'

export function CutPage() {
  const page = useProcessingPage(async (_file) => {
    // P2에서 실제 자르기 로직 구현 예정
    await new Promise<void>((resolve) => setTimeout(resolve, 1200))
  })

  return (
    <ProcessingPageShell
      title="음원 자르기"
      description="mp3 파일의 원하는 구간을 잘라 저장합니다."
      processLabel="처리 시작"
      processingLabel="처리 중..."
      successContent={
        <InfoMessageCard type="info" message="P2에서 자른 결과 파일이 여기에 표시됩니다." />
      }
      {...page}
    />
  )
}
