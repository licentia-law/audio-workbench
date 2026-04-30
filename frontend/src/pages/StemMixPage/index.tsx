import { useProcessingPage } from '../../hooks/useProcessingPage'
import { ProcessingPageShell } from '../../components/layout/ProcessingPageShell'
import { InfoMessageCard } from '../../components/feedback/InfoMessageCard'

export function StemMixPage() {
  const page = useProcessingPage(async (_file) => {
    // P6에서 Demucs 기반 스템 분리 로직 구현 예정
    await new Promise<void>((resolve) => setTimeout(resolve, 1200))
  })

  return (
    <ProcessingPageShell
      title="스템 분리"
      description="보컬, 드럼, 베이스, 기타 스템을 분리합니다."
      processLabel="분리 시작"
      processingLabel="분리 중..."
      successContent={
        <InfoMessageCard type="info" message="P6에서 스템별 다운로드 카드가 여기에 표시됩니다." />
      }
      {...page}
    />
  )
}
