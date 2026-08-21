// app/composables/useWorkspace.ts
export interface Workspace {
  id: number
  name: string
  slug: string
  currency: string
  status: 'active' | 'inactive' | 'suspended'
}

interface TenantRecord {
  id: number
  name: string
  slug: string
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

  async function createWorkspace(name: string, slug: string) {
    pending.value = true
    error.value = null
    try {
      const tenantRecord = await api.post<TenantRecord>('/tenants', { name, slug })
      tenant.value = tenantRecord
      if (user.value) {
        user.value.current_tenant_id = tenantRecord.id
      }
      fetchedForTenantId = tenantRecord.id
      return tenantRecord
    } catch (e) {
      error.value = extractApiErrorMessage(e)
      throw e
    } finally {
      pending.value = false
    }
  }

  async function updateSettings(patch: {
    name?: string
    slug?: string
    currency?: string
  }) {
    if (!tenant.value) return
    const body: Record<string, unknown> = {}
    if (patch.name !== undefined) body.name = patch.name
    if (patch.slug !== undefined) body.slug = patch.slug
    // Settings is a single JSON column server-side — merge in, don't replace,
    // so other keys that might live there survive an unrelated field's save.
    if (patch.currency !== undefined) body.settings = { ...(tenant.value.settings ?? {}), currency: patch.currency }

    tenant.value = await api.patch<TenantRecord>(`/tenants/${tenant.value.id}`, body)
  }

  const isOwner = computed(() => {
    if (!user.value?.tenants || !tenant.value) return false
    const t = user.value.tenants.find((t) => t.id === tenant.value!.id)
    return t?.pivot?.role === 'owner'
  })

  async function deleteWorkspace() {
    if (!tenant.value) return
    pending.value = true
    error.value = null
    try {
      await api.delete(`/tenants/${tenant.value.id}`)
      tenant.value = null
      fetchedForTenantId = null
      if (user.value) {
        user.value.current_tenant_id = null
        // refresh the user object to get the updated tenants list if needed, or just let the caller handle redirection
      }
    } catch (e) {
      error.value = extractApiErrorMessage(e)
      throw e
    } finally {
      pending.value = false
    }
  }

  return { workspace, isOwner, pending, error, fetchWorkspace, createWorkspace, updateSettings, deleteWorkspace }
}
