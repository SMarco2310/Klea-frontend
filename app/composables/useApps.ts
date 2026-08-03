// app/composables/useApps.ts
export function useApps() {
  const { apps } = useSeedData()
  const route = useRoute()

  const currentApp = computed(() =>
    apps.value.find((a) => a.slug === route.params.slug)
  )

  function createApp(name: string, slug: string) {
    const newApp = {
      id: `app-${Date.now()}`,
      name,
      slug,
      status: 'active' as const,
      webhookUrl: null,
    }
    apps.value.push(newApp)
    return newApp
  }

  function selectApp(slug: string) {
    navigateTo(`/apps/${slug}/overview`)
  }

  return { apps, currentApp, createApp, selectApp }
}
