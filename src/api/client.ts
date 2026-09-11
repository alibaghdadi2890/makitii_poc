import type { AdQuery, ApiAd, ApiCategory, ApiUser } from './types'

const BASE = '/api'
const TOKEN_KEY = 'makitii.token'

/** An error carrying the server's machine-readable code and field errors. */
export class ApiError extends Error {
  status: number
  code: string
  fields?: Record<string, string>

  constructor(status: number, code: string, fields?: Record<string, string>) {
    super(code)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const writeToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable — the session just won't survive a reload */
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = readToken()
  const headers = new Headers(init.headers)
  // FormData must set its own multipart boundary, so only JSON gets a type here.
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (res.status === 204) return undefined as T

  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    const body = (payload ?? {}) as { error?: string; fields?: Record<string, string> }
    throw new ApiError(res.status, body.error ?? 'request_failed', body.fields)
  }
  return payload as T
}

const query = (params: AdQuery) => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const api = {
  categories: () => request<{ categories: ApiCategory[] }>('/categories'),

  ads: (params: AdQuery = {}) =>
    request<{ items: ApiAd[]; total: number }>(`/ads${query(params)}`),

  ad: (slug: string) => request<{ ad: ApiAd }>(`/ads/${encodeURIComponent(slug)}`),

  myAds: () => request<{ items: ApiAd[] }>('/ads/mine'),

  createAd: (form: FormData) =>
    request<{ ad: ApiAd }>('/ads', { method: 'POST', body: form }),

  requestOtp: (body: { identifier: string; fullName?: string; mode: 'register' | 'login' }) =>
    request<{ sent: boolean; channel: 'email' | 'phone'; devCode?: string }>(
      '/auth/request-otp',
      { method: 'POST', body: JSON.stringify(body) },
    ),

  verifyOtp: (body: { identifier: string; code: string }) =>
    request<{ token: string; user: ApiUser }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: () => request<{ user: ApiUser }>('/auth/me'),

  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
}
