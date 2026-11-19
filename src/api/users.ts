import type { ChangePasswordRequest } from '../types/user'
import { apiPatch } from './client'

export const CHANGE_PASSWORD_ERRORS = {
  currentIncorrect: 'Current password is incorrect',
  sameAsCurrent: 'New password must be different from the current password',
  tooLong: 'password cannot be more than 72 bytes',
} as const

export function changeOwnPassword(body: ChangePasswordRequest): Promise<void> {
  return apiPatch<void>('/api/users/me/password', body)
}
