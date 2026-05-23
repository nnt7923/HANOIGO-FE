import type { AuthResponse } from '../types/api.type'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

const ACCESS_TOKEN = 'accessToken'
const REFRESH_TOKEN = 'refreshToken'

let refreshPromise: Promise<AuthResponse> | null = null
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN)
}

export function saveTokens(tokens: Pick<AuthResponse, 'accessToken' | 'refreshToken'>) {
  localStorage.setItem(ACCESS_TOKEN, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN, tokens.refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN)
  localStorage.removeItem(REFRESH_TOKEN)
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers)
  const body = options.body

  if (!headers.has('Content-Type') && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const accessToken = getAccessToken()
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && retry && getRefreshToken()) {
    try {
      await refreshSession()
      return apiFetch<T>(path, options, false)
    } catch (error) {
      clearTokens()
      unauthorizedHandler?.()
      throw error
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw error ?? new Error(`Request failed with ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json().catch(() => null)
          throw error ?? new Error('Refresh failed')
        }
        return response.json() as Promise<AuthResponse>
      })
      .then((tokens) => {
        saveTokens(tokens)
        return tokens
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export function toQuery(params: Record<string, unknown> = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}
