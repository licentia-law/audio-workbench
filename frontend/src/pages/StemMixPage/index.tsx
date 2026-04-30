import { PageHeader } from '../../components/layout/PageHeader'
import { FileUploadCard } from '../../components/upload/FileUploadCard'
import { FileMetaCard } from '../../components/result/FileMetaCard'
import { useFileStore } from '../../stores/fileStore'

export function StemMixPage() {
  const { uploadedFile } = useFileStore()

  return (
    <div>
      <PageHeader
        title="스템 분리"
        description="보컬, 드럼, 베이스, 기타 스템을 분리합니다."
      />
      <div className="space-y-4 max-w-xl">
        <FileUploadCard />
        {uploadedFile && <FileMetaCard meta={uploadedFile} />}
      </div>
    </div>
  )
}
