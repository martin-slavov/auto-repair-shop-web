import type { AuthUser, Role } from '../types/auth'

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)

  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

function isRole(value: unknown): value is Role {
  return value === 'CUSTOMER' || value === 'MECHANIC' || value === 'ADMIN'
}

export function decodeToken(token: string): AuthUser | null {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }

  let payload: unknown
  try {
    payload = JSON.parse(decodeBase64Url(parts[1]))
  } catch {
    return null
  }

  if (typeof payload !== 'object' || payload === null) {
    return null
  }

  const { sub, role, exp } = payload as Record<string, unknown>
  if (typeof sub !== 'string' || sub === '' || !isRole(role) || typeof exp !== 'number') {
    return null
  }

  if (exp * 1000 <= Date.now()) {
    return null
  }

  return { username: sub, role, expiresAt: exp * 1000 }
}
