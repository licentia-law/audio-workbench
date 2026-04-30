import { PageHeader } from '../../components/layout/PageHeader'
import { FileUploadCard } from '../../components/upload/FileUploadCard'
import { FileMetaCard } from '../../components/result/FileMetaCard'
import { useFileStore } from '../../stores/fileStore'

export function KeyShiftPage() {
  const { uploadedFile } = useFileStore()

  return (
    <div>
      <PageHeader
        title="Key 변환"
        description="음원의 키(조성)를 반음 단위로 올리거나 내립니다."
      />
      <div className="space-y-4 max-w-xl">
        <FileUploadCard />
        {uploadedFile && <FileMetaCard meta={uploadedFile} />}
      </div>
    </div>
  )
}
