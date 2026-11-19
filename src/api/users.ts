import type { ChangePasswordRequest, UserProfile, UserProfileUpdateRequest } from '../types/user'
import { apiGet, apiPatch, apiPut } from './client'

export const CHANGE_PASSWORD_ERRORS = {
  currentIncorrect: 'Current password is incorrect',
  sameAsCurrent: 'New password must be different from the current password',
  tooLong: 'password cannot be more than 72 bytes',
} as const

export const EMAIL_IN_USE = 'Email is already in use'

export function changeOwnPassword(body: ChangePasswordRequest): Promise<void> {
  return apiPatch<void>('/api/users/me/password', body)
}

export function getMyProfile(signal?: AbortSignal): Promise<UserProfile> {
  return apiGet<UserProfile>('/api/users/me', signal)
}

export function updateMyProfile(body: UserProfileUpdateRequest): Promise<UserProfile> {
  return apiPut<UserProfile>('/api/users/me', body)
}
