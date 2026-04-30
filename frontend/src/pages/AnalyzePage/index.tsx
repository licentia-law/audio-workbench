import { useProcessingPage } from '../../hooks/useProcessingPage'
import { ProcessingPageShell } from '../../components/layout/ProcessingPageShell'
import { InfoMessageCard } from '../../components/feedback/InfoMessageCard'

export function AnalyzePage() {
  const page = useProcessingPage(async (_file) => {
    // P3에서 BPM/Key 분석 로직 구현 예정
    await new Promise<void>((resolve) => setTimeout(resolve, 1200))
  })

  return (
    <ProcessingPageShell
      title="음원 분석"
      description="BPM, 키, 파형 등 음원 정보를 분석합니다."
      processLabel="분석 시작"
      processingLabel="분석 중..."
      successContent={
        <InfoMessageCard type="info" message="P3에서 BPM/Key 분석 결과가 여기에 표시됩니다." />
      }
      {...page}
    />
  )
}
