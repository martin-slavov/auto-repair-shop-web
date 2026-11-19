import type { PageQuery } from './api'
import type { Role } from './auth'

// UserAdminDTO
export interface UserAdmin {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: Role
  enabled: boolean
}

export const USER_ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  MECHANIC: 'Mechanic',
  CUSTOMER: 'Customer',
}

export type CreatableRole = Extract<Role, 'MECHANIC' | 'ADMIN'>

export const CREATABLE_ROLES: CreatableRole[] = ['MECHANIC', 'ADMIN']

export type UserSortField = 'username' | 'email' | 'role' | 'enabled' | 'id'

export type UserQuery = PageQuery<UserSortField> & {
  username?: string
  email?: string
  role?: Role | ''
  enabled?: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export type UserProfile = UserAdmin

export interface UserProfileUpdateRequest {
  email: string
  firstName: string
  lastName: string
}
