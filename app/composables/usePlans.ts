// app/composables/usePlans.ts
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { Feature } from './useFeatures'

export type BillingPeriod = 'one_time' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

export interface Plan {
  id: number
  application_id: number
  name: string
  price: number
  currency: string
  billing_period: BillingPeriod
  duration_days: number | null
  grace_period_days: number
  yearly_discount_percent: number
  position: number
  is_active: boolean
  features?: Feature[]
}

export function usePlans(appId: MaybeRefOrGetter<number | string>) {
  const api = useApi()
  const plans = ref<Plan[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchPlans() {
    pending.value = true
    error.value = null
    try {
      const page = await api.get<Paginated<Plan>>('/plans')
      plans.value = page.data
        .filter((p) => p.application_id === Number(toValue(appId)))
        .sort((a, b) => a.position - b.position)
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  async function createPlan(input: {
    name: string
    price: number
    currency: string
    billing_period: BillingPeriod
    duration_days?: number
    yearly_discount_percent: number
    is_active?: boolean
  }) {
    const plan = await api.post<Plan>('/plans', { ...input, application_id: Number(toValue(appId)) })
    plans.value.push(plan)
    return plan
  }

  async function updatePlan(id: number, patch: Partial<Pick<Plan, 'name' | 'price' | 'currency' | 'billing_period' | 'duration_days' | 'yearly_discount_percent' | 'is_active'>>) {
    const plan = await api.patch<Plan>(`/plans/${id}`, patch)
    const idx = plans.value.findIndex((p) => p.id === id)
    if (idx !== -1) plans.value[idx] = { ...plans.value[idx], ...plan }
    return plan
  }

  async function deletePlan(id: number) {
    await api.delete(`/plans/${id}`)
    plans.value = plans.value.filter((p) => p.id !== id)
  }

  async function reorderPlans(newOrder: Plan[]) {
    plans.value = newOrder
    await api.post('/plans/reorder', { plan_ids: newOrder.map((p) => p.id) })
  }

  async function attachFeature(planId: number, featureId: number, limit?: number | null) {
    const plan = await api.post<Plan>(`/plans/${planId}/features`, { feature_id: featureId, limit })
    const idx = plans.value.findIndex((p) => p.id === planId)
    if (idx !== -1) plans.value[idx] = plan
    return plan
  }

  async function detachFeature(planId: number, featureId: number) {
    await api.delete(`/plans/${planId}/features/${featureId}`)
    const plan = plans.value.find((p) => p.id === planId)
    if (plan?.features) plan.features = plan.features.filter((f) => f.id !== featureId)
  }

  return {
    plans,
    pending,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    reorderPlans,
    attachFeature,
    detachFeature,
  }
}
