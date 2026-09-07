// app/composables/useSubscriptions.ts
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { Plan } from './usePlans'

export interface Subscriber {
  id: number
  tenant_id: number
  external_id: string
  phone_number: string
  email: string
  environment: 'test' | 'live'
  created_at: string
}

export interface Subscription {
  id: number
  subscriber_id: number
  plan_id: number
  status: string
  starts_at: string
  expires_at: string | null
  cancelled_at: string | null
  environment: 'test' | 'live'
  created_at: string
  subscriber?: Subscriber
  plan?: Plan
}

export function useSubscriptions(appId: MaybeRefOrGetter<number | string>) {
  const api = useApi()
  const { mode } = useEnvMode()
  const all = ref<Subscription[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchSubscriptions() {
    pending.value = true
    error.value = null
    try {
      const page = await api.get<Paginated<Subscription>>('/subscriptions')
      all.value = page.data
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  // Subscriptions have no application_id of their own — scoping to an app
  // goes through the plan they were bought on.
  const subscriptions = computed(() =>
    all.value.filter((s) => s.plan?.application_id === Number(toValue(appId)) && s.environment === mode.value)
  )

  async function cancelSubscription(id: number) {
    await api.delete(`/subscriptions/${id}`)
    const idx = all.value.findIndex((s) => s.id === id)
    if (idx !== -1) all.value[idx] = { ...all.value[idx], status: 'cancelled' }
  }

  return { subscriptions, pending, error, fetchSubscriptions, cancelSubscription }
}
