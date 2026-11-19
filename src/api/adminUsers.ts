import type { PageResponse } from '../types/api'
import type { RegisterRequest, RegisterResponse } from '../types/auth'
import type {
  CreatableRole,
  UserAdmin,
  UserProfileUpdateRequest,
  UserQuery,
} from '../types/user'
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, buildQueryString } from './client'

const CREATE_PATHS: Record<CreatableRole, string> = {
  MECHANIC: '/api/admin/users/mechanic',
  ADMIN: '/api/admin/users/admin',
}

export function getUsers(
  query: UserQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<UserAdmin>> {
  return apiGet<PageResponse<UserAdmin>>('/api/admin/users' + buildQueryString(query), signal)
}

export function createUser(role: CreatableRole, body: RegisterRequest): Promise<RegisterResponse> {
  return apiPost<RegisterResponse>(CREATE_PATHS[role], body)
}

export function setUserEnabled(id: number, enabled: boolean): Promise<UserAdmin> {
  return apiPatch<UserAdmin>(`/api/admin/users/${id}/enabled`, { enabled })
}

export function updateUser(id: number, body: UserProfileUpdateRequest): Promise<UserAdmin> {
  return apiPut<UserAdmin>(`/api/admin/users/${id}`, body)
}

export function deleteUser(id: number): Promise<void> {
  return apiDelete(`/api/admin/users/${id}`)
}
