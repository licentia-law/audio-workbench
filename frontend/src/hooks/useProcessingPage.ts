import { useState, useCallback, useRef } from 'react'
import { useFileStore } from '../stores/fileStore'
import { apiService } from '../services/api'
import type { FileMeta, UploadStatus } from '../types'

export interface ProcessingPageState {
  uploadedFile: FileMeta | null
  pageStatus: UploadStatus
  peaks: number[] | undefined
  errorMsg: string | null
  audioSrc: string | undefined
  onUploadSuccess: (meta: FileMeta) => void
  onUploadError: (msg: string) => void
  onProcess: () => void
  onReset: () => void
}

export function useProcessingPage(
  processHandler: (file: FileMeta) => Promise<void>
): ProcessingPageState {
  const { uploadedFile, setUploadedFile } = useFileStore()
  const [pageStatus, setPageStatus] = useState<UploadStatus>('empty')
  const [peaks, setPeaks] = useState<number[] | undefined>()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handlerRef = useRef(processHandler)
  handlerRef.current = processHandler

  const audioSrc = uploadedFile
    ? `/api/file/${uploadedFile.file_id}/audio`
    : undefined

  const onUploadSuccess = useCallback(async (meta: FileMeta) => {
    setUploadedFile(meta)
    setErrorMsg(null)
    setPeaks(undefined)
    try {
      const waveform = await apiService.getWaveform(meta.file_id)
      setPeaks(waveform.peaks)
    } catch {
      // peaks 없어도 재생 가능
    }
    setPageStatus('uploaded')
  }, [setUploadedFile])

  const onUploadError = useCallback((msg: string) => {
    setErrorMsg(msg)
    setPageStatus('error')
  }, [])

  const onProcess = useCallback(async () => {
    if (!uploadedFile) return
    setPageStatus('processing')
    setErrorMsg(null)
    try {
      await handlerRef.current(uploadedFile)
      setPageStatus('success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '처리에 실패했습니다.'
      setErrorMsg(msg)
      setPageStatus('error')
    }
  }, [uploadedFile])

  const onReset = useCallback(() => {
    setPageStatus('empty')
    setErrorMsg(null)
    setPeaks(undefined)
  }, [])

  return {
    uploadedFile,
    pageStatus,
    peaks,
    errorMsg,
    audioSrc,
    onUploadSuccess,
    onUploadError,
    onProcess,
    onReset,
  }
}
