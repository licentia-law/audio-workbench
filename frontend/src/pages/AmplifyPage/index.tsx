import { PageHeader } from '../../components/layout/PageHeader'
import { FileUploadCard } from '../../components/upload/FileUploadCard'
import { FileMetaCard } from '../../components/result/FileMetaCard'
import { useFileStore } from '../../stores/fileStore'

export function AmplifyPage() {
  const { uploadedFile } = useFileStore()

  return (
    <div>
      <PageHeader
        title="음량 증폭"
        description="음원의 전체 볼륨을 dB 단위로 조정합니다."
      />
      <div className="space-y-4 max-w-xl">
        <FileUploadCard />
        {uploadedFile && <FileMetaCard meta={uploadedFile} />}
      </div>
    </div>
  )
}
