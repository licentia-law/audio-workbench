import { create } from 'zustand'
import type { FileMeta } from '../types'

interface FileStore {
  uploadedFile: FileMeta | null
  setUploadedFile: (meta: FileMeta) => void
  reset: () => void
}

export const useFileStore = create<FileStore>((set) => ({
  uploadedFile: null,
  setUploadedFile: (meta) => set({ uploadedFile: meta }),
  reset: () => set({ uploadedFile: null }),
}))
