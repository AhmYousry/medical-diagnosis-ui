import api from './api'
import type {
  AdminUserResponse,
  AdminPredictionResponse,
  PredictionLog,
  PaginatedResponse,
} from '@/types'

export const adminService = {
  async listUsers(params?: {
    page?: number
    size?: number
    role?: string
    search?: string
  }): Promise<PaginatedResponse<AdminUserResponse>> {
    const res = await api.get('/admin/users', { params })
    return res.data
  },
  async listDoctors(params?: {
    page?: number
    size?: number
    verification_status?: string
    search?: string
  }): Promise<PaginatedResponse<any>> {
    const res = await api.get('/admin/doctors', { params })
    return res.data
  },
  async listPredictions(params?: {
    page?: number
    size?: number
    status?: string
    user_id?: string
    search?: string
  }): Promise<PaginatedResponse<AdminPredictionResponse>> {
    const res = await api.get('/admin/predictions', { params })
    return res.data
  },
  async getPrediction(id: string): Promise<AdminPredictionResponse> {
    const res = await api.get(`/admin/predictions/${id}`)
    return res.data
  },
  async getPredictionLogs(
    id: string,
    params?: { page?: number; size?: number; event?: string }
  ): Promise<PaginatedResponse<PredictionLog>> {
    const res = await api.get(`/admin/predictions/${id}/logs`, { params })
    return res.data
  },
  async verifyDoctor(userId: string, status: 'verified' | 'rejected', reason?: string): Promise<void> {
    await api.patch(`/admin/doctors/${userId}/verify`, { status, rejection_reason: reason })
  },
}
