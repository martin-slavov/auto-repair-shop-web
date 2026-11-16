import type { LoginRequest, LoginResponse } from '../types/auth'
import { apiPost } from './client'

export async function login(username: string, password: string): Promise<string> {
  const body: LoginRequest = { username, password }
  const response = await apiPost<LoginResponse>('/api/auth/login', body)
  return response.token
}
