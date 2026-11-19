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

export type UserSortField = 'username' | 'email' | 'role' | 'enabled' | 'id'

export type UserQuery = PageQuery<UserSortField> & {
  username?: string
  email?: string
  role?: Role | ''
  enabled?: boolean
}
