import type { ErrorResponse } from '../types/api'
import { getToken } from '../auth/tokenStorage'

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Copy .env.example to .env and restart npm run dev.',
    )
  }

  const headers = new Headers(options.headers)
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(baseUrl + path, { ...options, headers })
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    let fieldErrors: Record<string, string> = {}
    try {
      const error = (await response.json()) as ErrorResponse
      if (error.message) {
        message = error.message
      }
      if (error.fieldErrors) {
        fieldErrors = error.fieldErrors
      }
    } catch {
      // The body was not JSON; keep the generic message.
    }
    throw new ApiError(message, response.status, fieldErrors)
  }

  return (await response.json()) as T
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path)
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
