// app/composables/useAdminAuth.ts
// Operator-facing auth, deliberately separate from useAppAuth.ts (tenant
// auth). The tenant token lives in useCookie('auth_token') inside
// useApi.ts/useAppAuth.ts — using that same cookie key here would mean
// logging into the admin area clobbers a developer's tenant session (and
// vice versa), so the operator token gets its own cookie key, 'admin_token'.
interface AdminUser {
  id: number
  name: string
  email: string
  last_login_at: string | null
}

interface LoginResponse {
  token: string
  admin: { id: number; name: string; email: string }
}

export function useAdminToken() {
  // Distinct cookie key from the tenant's 'auth_token' — see file banner.
  return useCookie<string | null>('admin_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30,
  })
}

export function useAdminAuth() {
  // useState (not a bare ref) so this is scoped per-request during SSR and
  // shared across every call site within a request — a module-scope ref
  // would leak between concurrent SSR requests, and a plain ref inside this
  // composable would give every caller (page + middleware) its own copy.
  const admin = useState<AdminUser | null>('admin-user', () => null)
  const token = useAdminToken()
  const config = useRuntimeConfig()

  const isSignedIn = computed(() => !!token.value)

  function authHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  function clearSession() {
    token.value = null
    admin.value = null
  }

  async function login(email: string, password: string) {
    // Talk to the admin API directly with $fetch (not useApi()/useAdminApi())
    // so the response's { token, admin } payload is typed explicitly here —
    // this is the one call that happens before a token exists.
    const res = await $fetch<{ data: LoginResponse; success: boolean; message: string }>(
      `${config.public.apiBaseUrl}/api/admin/login`,
      { method: 'POST', body: { email, password } },
    )
    token.value = res.data.token
    admin.value = { ...res.data.admin, last_login_at: null }
  }

  async function fetchCurrentAdmin() {
    if (!token.value) return
    try {
      const res = await $fetch<{ data: AdminUser; success: boolean; message: string }>(
        `${config.public.apiBaseUrl}/api/admin/me`,
        { headers: authHeaders() },
      )
      admin.value = res.data
    } catch (e) {
      if (isAdminUnauthorized(e)) clearSession()
      throw e
    }
  }

  async function logout() {
    if (token.value) {
      await $fetch(`${config.public.apiBaseUrl}/api/admin/logout`, {
        method: 'POST',
        headers: authHeaders(),
      }).catch(() => {})
    }
    clearSession()
  }

  return {
    admin,
    isSignedIn,
    login,
    fetchCurrentAdmin,
    logout,
  }
}

/** True if a caught $fetch error is an HTTP 401 (expired/invalid/missing operator token). */
export function isAdminUnauthorized(err: unknown): boolean {
  return (err as { statusCode?: number; response?: { status?: number } })?.statusCode === 401
    || (err as { statusCode?: number; response?: { status?: number } })?.response?.status === 401
}
