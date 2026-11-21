import type { ErrorResponse } from '../types/api'
import { getToken } from '../auth/tokenStorage'

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>
  retryAfter?: number

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string> = {},
    retryAfter?: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
    this.retryAfter = retryAfter
  }
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined
}

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
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
    // Only a 401 for a request that sent a token means the session is no longer valid.
    // Without a token (e.g. a wrong password on login) it is a normal error for the form.
    if (response.status === 401 && token && unauthorizedHandler) {
      unauthorizedHandler()
    }

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
    throw new ApiError(
      message,
      response.status,
      fieldErrors,
      parseRetryAfter(response.headers.get('Retry-After')),
    )
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export type QueryValue = string | number | boolean | null | undefined

export function buildQueryString(params: Record<string, QueryValue>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue
    const text = String(value).trim()
    if (text === '') continue
    searchParams.set(key, text)
  }
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>(path, { signal })
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  if (body === undefined) {
    return request<T>(path, { method: 'PATCH' })
  }
  return request<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function apiDelete<T = void>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}
