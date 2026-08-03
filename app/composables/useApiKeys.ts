// app/composables/useApiKeys.ts
type ApiKeyRecord = import('./useSeedData').ApiKey

function generateFullKey(env: 'test' | 'live'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let random = ''
  for (let i = 0; i < 32; i++) {
    random += chars[Math.floor(Math.random() * chars.length)]
  }
  return `lk_${env}_${random}`
}

function maskKey(fullKey: string, env: 'test' | 'live'): string {
  const prefix = `lk_${env}_`
  const tail = fullKey.slice(-4)
  return `${prefix}....${tail}`
}

export function useApiKeys(appId: string) {
  const { apiKeys } = useSeedData()
  const { mode } = useEnvMode()

  const scopedApiKeys = computed(() =>
    apiKeys.value.filter((k) => k.appId === appId && k.env === mode.value)
  )

  function createApiKey(name: string) {
    const env = mode.value
    const fullKey = generateFullKey(env)
    const record: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      appId,
      name,
      env,
      maskedKey: maskKey(fullKey, env),
      createdAt: new Date().toISOString(),
    }
    apiKeys.value.push(record)
    return { record, fullKey }
  }

  function revokeApiKey(id: string) {
    apiKeys.value = apiKeys.value.filter((k) => k.id !== id)
  }

  return { apiKeys: scopedApiKeys, createApiKey, revokeApiKey }
}
