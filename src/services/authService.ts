import api from './api'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post('/auth/login', data)
    return res.data
  },
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post('/auth/register', data)
    return res.data
  },
  async refresh(refreshToken: string): Promise<AuthResponse> {
    const res = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return res.data
  },
  async getMe(): Promise<User> {
    const res = await api.get('/auth/me')
    return res.data
  },
}
