// app/composables/useKleaAuth.ts
interface LaravelUser {
  id: number
  name: string
  email: string
  current_tenant_id: number | null
  email_verified_at: string | null
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

const user = ref<LaravelUser | null>(null)

export function useKleaAuth() {
  const token = useCookie<string | null>('auth_token', { default: () => null })
  const config = useRuntimeConfig()

  const isSignedIn = computed(() => !!token.value)

  function authHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  async function login(email: string, password: string) {
    const res = await $fetch<AuthResponse>(`${config.public.apiBaseUrl}/api/login`, {
      method: 'POST',
      body: { email, password },
    })
    token.value = res.data.token
    user.value = res.data.user
  }

  async function register(name: string, email: string, password: string) {
    const res = await $fetch<AuthResponse>(`${config.public.apiBaseUrl}/api/register`, {
      method: 'POST',
      body: { name, email, password },
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
    const res = await $fetch<UserResponse>(`${config.public.apiBaseUrl}/api/me`, {
      headers: authHeaders(),
    })
    user.value = res.data
  }

  async function logout() {
    if (token.value) {
      await $fetch(`${config.public.apiBaseUrl}/api/logout`, {
        method: 'POST',
        headers: authHeaders(),
      }).catch(() => {})
    }
    token.value = null
    user.value = null
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
  }
}

export function extractAuthErrorMessage(err: unknown): string {
  const fetchError = err as { data?: { message?: string } }
  return fetchError?.data?.message || 'Something went wrong. Please try again.'
}
