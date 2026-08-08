// app/composables/useWebhooks.ts
export function useWebhooks() {
  const { currentApp } = useApps()

  // Webhook delivery logs aren't linked back to an application by the API yet
  // (webhook_logs -> transaction -> subscription -> plan -> application, but
  // the list endpoint doesn't eager-load that chain), so there's no reliable
  // way to scope deliveries to this app. Stays empty until the API exposes it.
  const deliveries = ref<{ id: number; event: string; status: 'success' | 'failed'; createdAt: string }[]>([])
  const endpointUrl = computed(() => currentApp.value?.webhook_url ?? null)
  const webhookSecret = computed(() => currentApp.value?.webhook_secret ?? null)

  return { deliveries, endpointUrl, webhookSecret }
}
