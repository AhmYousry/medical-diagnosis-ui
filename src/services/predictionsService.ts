import api from './api'
import type { Prediction, PredictionListResponse } from '@/types'

export const predictionsService = {
  async create(fileId: string): Promise<Prediction> {
    const res = await api.post(`/predict/${fileId}`)
    return res.data
  },
  async list(): Promise<PredictionListResponse> {
    const res = await api.get('/predict')
    return res.data
  },
  async get(id: string): Promise<Prediction> {
    const res = await api.get(`/predict/${id}`)
    return res.data
  },
}
