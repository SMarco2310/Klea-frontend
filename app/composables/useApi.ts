// app/composables/useApi.ts
// Shared fetch wrapper for the Laravel API: base URL, bearer auth header,
// and the {data, success, message} envelope every backend endpoint uses.

interface Envelope<T> {
  data: T
  success: boolean
  message: string
}

export interface Paginated<T> {
  data: T[]
  links: { first: string | null; last: string | null; prev: string | null; next: string | null }
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

export function useApi() {
  const token = useCookie<string | null>('auth_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30,
  })
  const config = useRuntimeConfig()

  function authHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  async function request<T>(path: string, opts: { method?: string; body?: Record<string, unknown> } = {}): Promise<T> {
    const res = await $fetch<Envelope<T>>(`${config.public.apiBaseUrl}/api${path}`, {
      method: (opts.method ?? 'GET') as 'GET',
      headers: authHeaders(),
      body: opts.body,
    })
    return res.data
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: Record<string, unknown>) => request<T>(path, { method: 'POST', body }),
    patch: <T>(path: string, body?: Record<string, unknown>) => request<T>(path, { method: 'PATCH', body }),
    put: <T>(path: string, body?: Record<string, unknown>) => request<T>(path, { method: 'PUT', body }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  }
}

export function extractApiErrorMessage(err: unknown): string {
  const fetchError = err as { data?: { message?: string } }
  return fetchError?.data?.message || 'Something went wrong. Please try again.'
}
