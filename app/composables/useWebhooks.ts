// app/composables/useWebhooks.ts
export function useWebhooks(appId: string) {
  const { webhookDeliveries, apps } = useSeedData()

  const deliveries = computed(() => webhookDeliveries.value.filter((d) => d.appId === appId))
  const endpointUrl = computed(() => apps.value.find((a) => a.id === appId)?.webhookUrl ?? null)

  return { deliveries, endpointUrl }
}
