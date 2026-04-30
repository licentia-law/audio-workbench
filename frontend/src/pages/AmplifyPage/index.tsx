import { useProcessingPage } from '../../hooks/useProcessingPage'
import { ProcessingPageShell } from '../../components/layout/ProcessingPageShell'
import { InfoMessageCard } from '../../components/feedback/InfoMessageCard'

export function AmplifyPage() {
  const page = useProcessingPage(async (_file) => {
    // P5에서 ffmpeg 기반 음량 증폭 로직 구현 예정
    await new Promise<void>((resolve) => setTimeout(resolve, 1200))
  })

  return (
    <ProcessingPageShell
      title="음량 증폭"
      description="음원의 전체 볼륨을 dB 단위로 조정합니다."
      processLabel="처리 시작"
      processingLabel="처리 중..."
      successContent={
        <InfoMessageCard type="info" message="P5에서 음량 증폭 결과 파일이 여기에 표시됩니다." />
      }
      {...page}
    />
  )
}
