// app/composables/useWebhooks.ts
export function useWebhooks() {
  const { currentApp } = useApps()

  const api = useApi()
  const deliveries = ref<{ id: number; provider_tx_id: number; payload: string; status_code: string; processed_at: string | null; created_at: string }[]>([])
  const endpointUrl = computed(() => currentApp.value?.webhook_url ?? null)
  const webhookSecret = computed(() => currentApp.value?.webhook_secret ?? null)
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchDeliveries() {
    if (!currentApp.value) return
    pending.value = true
    error.value = null
    try {
      const res = await api.get<Paginated<any>>(`/webhook-logs?app_id=${currentApp.value.id}`)
      deliveries.value = res.data
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  return { deliveries, endpointUrl, webhookSecret, pending, error, fetchDeliveries }
}
