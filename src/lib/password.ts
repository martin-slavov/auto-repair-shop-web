const PASSWORD_MAX_BYTES = 72

export function validatePasswordPair(
  password: string,
  confirmPassword: string,
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    errors.password =
      'Password cannot be more than 72 bytes (some characters, like emoji, count as more than one).'
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}
