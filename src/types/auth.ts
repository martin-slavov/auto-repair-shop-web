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

export interface RegisterRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

export interface RegisterResponse {
  id: number
  username: string
  email: string
  role: Role
}
