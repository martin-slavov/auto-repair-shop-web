import type { ErrorResponse } from '../types/api'

// Sends a GET request to the API and returns the JSON body as type T.
// Throws an Error with a readable message if the request fails.
export async function apiGet<T>(path: string): Promise<T> {
  // Vite only exposes variables that start with VITE_ to the browser code.
  const baseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Copy .env.example to .env and restart npm run dev.',
    )
  }

  const response = await fetch(baseUrl + path)

  // fetch does NOT throw on 4xx/5xx responses, so we check the status ourselves.
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const error = (await response.json()) as ErrorResponse
      if (error.message) {
        message = error.message
      }
    } catch {
      // The body was not JSON; keep the generic message.
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}
