// app/composables/useApiKeys.ts
export interface ApiKey {
  id: number
  application_id: number
  name: string
  environment: 'test' | 'live'
  public_id: string
  last_used_at: string | null
  revoked_at: string | null
  created_at: string
}

export function useApiKeys(appId: number | string) {
  const api = useApi()
  const { mode } = useEnvMode()
  const all = ref<ApiKey[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchApiKeys() {
    pending.value = true
    error.value = null
    try {
      const page = await api.get<Paginated<ApiKey>>('/api-keys')
      all.value = page.data
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  const apiKeys = computed(() =>
    all.value.filter(
      (k) => k.application_id === Number(appId) && k.environment === mode.value && !k.revoked_at
    )
  )

  async function createApiKey(name: string) {
    const created = await api.post<ApiKey & { secret: string }>('/api-keys', {
      application_id: Number(appId),
      name,
      environment: mode.value,
    })
    all.value.push(created)
    // public_id and secret are only ever concatenated here, at creation —
    // the secret can't be recovered from the API again after this.
    return { record: created, fullKey: `${created.public_id}.${created.secret}` }
  }

  async function revokeApiKey(id: number) {
    await api.delete(`/api-keys/${id}`)
    const key = all.value.find((k) => k.id === id)
    if (key) key.revoked_at = new Date().toISOString()
  }

  return { apiKeys, pending, error, fetchApiKeys, createApiKey, revokeApiKey }
}
