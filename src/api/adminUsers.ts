import type { PageResponse } from '../types/api'
import type { UserAdmin, UserQuery } from '../types/user'
import { apiGet, buildQueryString } from './client'

export function getUsers(
  query: UserQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<UserAdmin>> {
  return apiGet<PageResponse<UserAdmin>>('/api/admin/users' + buildQueryString(query), signal)
}
