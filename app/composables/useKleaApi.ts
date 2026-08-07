// app/composables/useKleaApi.ts
/**
 * Shared authenticated fetch for talking to the Laravel API. Attaches the
 * bearer token automatically and clears the session on any 401 so an
 * expired/revoked token can't be reused across subsequent calls — every
 * composable that calls a protected endpoint should go through this
 * instead of building its own $fetch, so 401 handling stays centralized.
 */
export function useKleaApi() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('auth_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30,
  })
  const user = useState<{ id: number } | null>('klea-user', () => null)

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    onRequest({ options }) {
      if (token.value) {
        options.headers.set('Authorization', `Bearer ${token.value}`)
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        token.value = null
        user.value = null
      }
    },
  })

  return { api }
}
