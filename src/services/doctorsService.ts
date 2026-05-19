import api from './api'
import type { DoctorProfile } from '@/types'

export const doctorsService = {
  async register(data: {
    license_number: string
    specialization: string
    clinic_name?: string
    bio?: string
  }): Promise<DoctorProfile> {
    const res = await api.post('/doctors/register', data)
    return res.data
  },
  async getProfile(): Promise<DoctorProfile> {
    const res = await api.get('/doctors/profile')
    return res.data
  },
}
