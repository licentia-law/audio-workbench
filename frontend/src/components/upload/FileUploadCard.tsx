import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { StatusBadge } from '../feedback/StatusBadge'
import { useFileStore } from '../../stores/fileStore'
import { apiService } from '../../services/api'
import type { FileMeta, UploadStatus } from '../../types'

const MAX_SIZE_BYTES = 20 * 1024 * 1024
const MAX_DURATION_SEC = 600

interface FileUploadCardProps {
  onSuccess?: (meta: FileMeta) => void
  onError?: (message: string) => void
}

export function FileUploadCard({ onSuccess, onError }: FileUploadCardProps = {}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<UploadStatus>('empty')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { setUploadedFile } = useFileStore()

  function validateFile(file: File): string | null {
    if (!file.name.toLowerCase().endsWith('.mp3')) return 'mp3 파일만 업로드 가능합니다.'
    if (file.size > MAX_SIZE_BYTES) return '파일 크기는 20MB 이하여야 합니다.'
    return null
  }

  async function checkDuration(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src)
        resolve(audio.duration <= MAX_DURATION_SEC)
      }
      audio.onerror = () => resolve(true) // 백엔드에서 2차 검증
    })
  }

  async function handleFile(file: File) {
    setErrorMsg(null)

    const validationError = validateFile(file)
    if (validationError) {
      setStatus('error')
      setErrorMsg(validationError)
      onError?.(validationError)
      return
    }

    const durationOk = await checkDuration(file)
    if (!durationOk) {
      const msg = '파일 길이는 10분 이하여야 합니다.'
      setStatus('error')
      setErrorMsg(msg)
      onError?.(msg)
      return
    }

    setStatus('processing')
    try {
      const result = await apiService.upload(file)
      setUploadedFile(result)
      setStatus('uploaded')
      onSuccess?.(result)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '업로드에 실패했습니다.'
      setStatus('error')
      setErrorMsg(msg)
      onError?.(msg)
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave() {
    setIsDragging(false)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="rounded-xl bg-surface-raised border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">파일 업로드</h3>
        <StatusBadge status={status} />
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragging ? 'border-accent bg-accent/10' : 'border-white/20 hover:border-white/40'}
        `}
      >
        <p className="text-sm text-gray-400">
          mp3 파일을 드래그하거나 <span className="text-accent font-medium">클릭하여 선택</span>하세요
        </p>
        <p className="mt-1 text-xs text-gray-600">최대 20MB / 10분 이하</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".mp3,audio/mpeg"
        className="hidden"
        onChange={onInputChange}
      />

      {errorMsg && (
        <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{errorMsg}</p>
      )}
    </div>
  )
}
