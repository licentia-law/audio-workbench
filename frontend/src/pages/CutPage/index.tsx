import { PageHeader } from '../../components/layout/PageHeader'
import { FileUploadCard } from '../../components/upload/FileUploadCard'
import { FileMetaCard } from '../../components/result/FileMetaCard'
import { useFileStore } from '../../stores/fileStore'

export function CutPage() {
  const { uploadedFile } = useFileStore()

  return (
    <div>
      <PageHeader
        title="음원 자르기"
        description="mp3 파일의 원하는 구간을 잘라 저장합니다."
      />
      <div className="space-y-4 max-w-xl">
        <FileUploadCard />
        {uploadedFile && <FileMetaCard meta={uploadedFile} />}
      </div>
    </div>
  )
}
