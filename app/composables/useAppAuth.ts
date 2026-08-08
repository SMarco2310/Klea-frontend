// app/composables/useAppAuth.ts
interface LaravelTenant {
  id: number
  name: string
  slug: string
  pivot?: { role: string }
}

interface LaravelUser {
  id: number
  name: string
  email: string
  current_tenant_id: number | null
  email_verified_at: string | null
  tenants?: LaravelTenant[]
}

interface AuthResponse {
  data: {
    user: LaravelUser
    token: string
  }
  success: boolean
  message: string
}

interface UserResponse {
  data: LaravelUser
  success: boolean
  message: string
}

interface ApiMessageResponse {
  success: boolean
  message: string
}

export function useAppAuth() {
  // useState (not a bare ref) so this is scoped per-request during SSR —
  // a module-level ref would be a single instance shared by every
  // concurrent request on the server, leaking one user's data into
  // another's render.
  const user = useState<LaravelUser | null>('klea-user', () => null)
  const token = useCookie<string | null>('auth_token', {
    default: () => null,
    // Persist across browser restarts, not just the current session —
    // backend tokens no longer expire (see config/sanctum.php), so there's
    // no reason to force a re-login just because the browser was closed.
    maxAge: 60 * 60 * 24 * 30,
  })
  const config = useRuntimeConfig()

  const isSignedIn = computed(() => !!token.value)

  function authHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  /** Clears local session state without calling the backend (token already invalid/expired). */
  function clearSession() {
    token.value = null
    user.value = null
  }

  async function login(email: string, password: string) {
    const res = await $fetch<AuthResponse>(`${config.public.apiBaseUrl}/api/login`, {
      method: 'POST',
      body: { email, password },
    })
    token.value = res.data.token
    user.value = res.data.user
  }

  async function register(name: string, email: string, password: string, passwordConfirmation: string) {
    const res = await $fetch<AuthResponse>(`${config.public.apiBaseUrl}/api/register`, {
      method: 'POST',
      body: { name, email, password, password_confirmation: passwordConfirmation },
    })
    token.value = res.data.token
    user.value = res.data.user
  }

  async function loginWithClerkToken(sessionToken: string) {
    const res = await $fetch<AuthResponse>(`${config.public.apiBaseUrl}/api/auth/clerk`, {
      method: 'POST',
      body: { session_token: sessionToken },
    })
    token.value = res.data.token
    user.value = res.data.user
  }

  async function fetchCurrentUser() {
    if (!token.value) return
    try {
      const res = await $fetch<UserResponse>(`${config.public.apiBaseUrl}/api/me`, {
        headers: authHeaders(),
      })
      user.value = res.data
    } catch (e) {
      // Token is expired/invalid server-side — no point holding onto it
      // client-side either. Callers (e.g. auth middleware) decide what to
      // do next (redirect etc); this just guarantees state isn't stale.
      if (isUnauthorized(e)) clearSession()
      throw e
    }
  }

  async function logout() {
    if (token.value) {
      await $fetch(`${config.public.apiBaseUrl}/api/logout`, {
        method: 'POST',
        headers: authHeaders(),
      }).catch(() => {})
    }
    clearSession()
  }

  async function forgotPassword(email: string) {
    await $fetch<ApiMessageResponse>(`${config.public.apiBaseUrl}/api/forgot-password`, {
      method: 'POST',
      body: { email },
    })
  }

  async function resetPassword(token_: string, email: string, password: string, passwordConfirmation: string) {
    await $fetch<ApiMessageResponse>(`${config.public.apiBaseUrl}/api/reset-password`, {
      method: 'POST',
      body: {
        token: token_,
        email,
        password,
        password_confirmation: passwordConfirmation,
      },
    })
  }

  async function resendVerificationEmail() {
    await $fetch<ApiMessageResponse>(`${config.public.apiBaseUrl}/api/email/verification-notification`, {
      method: 'POST',
      headers: authHeaders(),
    })
  }

  async function updateProfile(patch: { name?: string; email?: string; password?: string; password_confirmation?: string }) {
    const res = await $fetch<UserResponse>(`${config.public.apiBaseUrl}/api/me`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: patch,
    })
    user.value = res.data
  }

  return {
    user,
    isSignedIn,
    login,
    register,
    loginWithClerkToken,
    fetchCurrentUser,
    logout,
    forgotPassword,
    resetPassword,
    resendVerificationEmail,
    updateProfile,
  }
}

export function extractAuthErrorMessage(err: unknown): string {
  const fetchError = err as { data?: { message?: string } }
  return fetchError?.data?.message || 'Something went wrong. Please try again.'
}

/** True if a caught $fetch error is an HTTP 401 (expired/invalid/missing token). */
export function isUnauthorized(err: unknown): boolean {
  return (err as { statusCode?: number; response?: { status?: number } })?.statusCode === 401
    || (err as { statusCode?: number; response?: { status?: number } })?.response?.status === 401
}
