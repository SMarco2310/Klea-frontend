// app/composables/useWorkspace.ts
export interface Workspace {
  id: number
  name: string
  slug: string
  currency: string
  semoaApiKey: string
  semoaMerchantId: string
  status: 'active' | 'inactive' | 'suspended'
}

interface TenantRecord {
  id: number
  name: string
  slug: string
  semoa_api_key: string | null
  semoa_merchant_id: string | null
  status: 'active' | 'inactive' | 'suspended'
  settings: Record<string, unknown> | null
}

const tenant = ref<TenantRecord | null>(null)
const pending = ref(false)
const error = ref<string | null>(null)
let fetchedForTenantId: number | null = null

const workspace = computed<Workspace>(() => ({
  id: tenant.value?.id ?? 0,
  name: tenant.value?.name ?? '',
  slug: tenant.value?.slug ?? '',
  currency: (tenant.value?.settings?.currency as string) || 'XOF',
  semoaApiKey: tenant.value?.semoa_api_key ?? '',
  semoaMerchantId: tenant.value?.semoa_merchant_id ?? '',
  status: tenant.value?.status ?? 'active',
}))

export function useWorkspace() {
  const api = useApi()
  const { user } = useAppAuth()

  async function fetchWorkspace() {
    const tenantId = user.value?.current_tenant_id
    if (!tenantId || fetchedForTenantId === tenantId) return
    pending.value = true
    error.value = null
    try {
      tenant.value = await api.get<TenantRecord>(`/tenants/${tenantId}`)
      fetchedForTenantId = tenantId
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  async function updateSettings(patch: {
    name?: string
    slug?: string
    currency?: string
    semoaApiKey?: string
    semoaMerchantId?: string
  }) {
    if (!tenant.value) return
    const body: Record<string, unknown> = {}
    if (patch.name !== undefined) body.name = patch.name
    if (patch.slug !== undefined) body.slug = patch.slug
    if (patch.semoaApiKey !== undefined) body.semoa_api_key = patch.semoaApiKey || null
    if (patch.semoaMerchantId !== undefined) body.semoa_merchant_id = patch.semoaMerchantId || null
    // Settings is a single JSON column server-side — merge in, don't replace,
    // so other keys that might live there survive an unrelated field's save.
    if (patch.currency !== undefined) body.settings = { ...(tenant.value.settings ?? {}), currency: patch.currency }

    tenant.value = await api.patch<TenantRecord>(`/tenants/${tenant.value.id}`, body)
  }

  return { workspace, pending, error, fetchWorkspace, updateSettings }
}
