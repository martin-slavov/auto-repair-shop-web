export type Role = 'CUSTOMER' | 'MECHANIC' | 'ADMIN'

export interface AuthUser {
  username: string
  role: Role
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}
