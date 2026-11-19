import type { ApiError } from '../api/client'
import { EMAIL_IN_USE } from '../api/users'
import type { UserProfileUpdateRequest } from '../types/user'

export const EMAIL_MAX = 254
export const NAME_MAX = 50

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/

export function validateProfile(values: UserProfileUpdateRequest): Record<string, string> {
  const errors: Record<string, string> = {}
  const email = values.email.trim()
  if (email === '') {
    errors.email = 'Enter an email address.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (values.firstName.trim() === '') {
    errors.firstName = 'Enter a first name.'
  }
  if (values.lastName.trim() === '') {
    errors.lastName = 'Enter a last name.'
  }
  return errors
}

export function profileApiErrors(err: ApiError): {
  fieldErrors: Record<string, string>
  message: string | null
} {
  if (Object.keys(err.fieldErrors).length > 0) {
    return { fieldErrors: err.fieldErrors, message: null }
  }
  if (err.message === EMAIL_IN_USE) {
    return { fieldErrors: { email: `${err.message}.` }, message: null }
  }
  return { fieldErrors: {}, message: err.message }
}
