import api from './api'
import type { UploadResponse } from '@/types'

export const uploadsService = {
  async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/uploads/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
  async list(): Promise<{ files: UploadResponse[]; total: number }> {
    const res = await api.get('/uploads')
    return res.data
  },
  async get(id: string): Promise<UploadResponse> {
    const res = await api.get(`/uploads/${id}`)
    return res.data
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/uploads/${id}`)
  },
}
