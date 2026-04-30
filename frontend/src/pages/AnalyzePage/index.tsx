import { PageHeader } from '../../components/layout/PageHeader'
import { FileUploadCard } from '../../components/upload/FileUploadCard'
import { FileMetaCard } from '../../components/result/FileMetaCard'
import { useFileStore } from '../../stores/fileStore'

export function AnalyzePage() {
  const { uploadedFile } = useFileStore()

  return (
    <div>
      <PageHeader
        title="음원 분석"
        description="BPM, 키, 파형 등 음원 정보를 분석합니다."
      />
      <div className="space-y-4 max-w-xl">
        <FileUploadCard />
        {uploadedFile && <FileMetaCard meta={uploadedFile} />}
      </div>
    </div>
  )
}
