// app/composables/useApps.ts
export interface App {
  id: number
  tenant_id: number
  name: string
  slug: string
  status: 'active' | 'inactive'
  webhook_url: string | null
  webhook_secret: string | null
}

const apps = ref<App[]>([])
const pending = ref(false)
const error = ref<string | null>(null)

export function useApps() {
  const api = useApi()
  const route = useRoute()

  const currentApp = computed(() =>
    apps.value.find((a) => a.slug === route.params.slug)
  )

  async function fetchApps() {
    pending.value = true
    error.value = null
    try {
      const page = await api.get<Paginated<App>>('/applications')
      apps.value = page.data
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  async function createApp(name: string, slug: string) {
    const app = await api.post<App>('/applications', { name, slug, status: 'active' })
    apps.value.push(app)
    return app
  }

  async function updateApp(id: number, patch: Partial<Pick<App, 'name' | 'slug' | 'status' | 'webhook_url' | 'webhook_secret'>>) {
    const app = await api.patch<App>(`/applications/${id}`, patch)
    const idx = apps.value.findIndex((a) => a.id === id)
    if (idx !== -1) apps.value[idx] = app
    return app
  }

  async function deleteApp(id: number) {
    await api.delete(`/applications/${id}`)
    apps.value = apps.value.filter((a) => a.id !== id)
  }

  function selectApp(slug: string) {
    navigateTo(`/apps/${slug}/analytics`)
  }

  return { apps, currentApp, pending, error, fetchApps, createApp, updateApp, deleteApp, selectApp }
}
