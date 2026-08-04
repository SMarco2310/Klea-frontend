// app/composables/usePlans.ts
export function usePlans(appId: string) {
  const { plans } = useSeedData()

  const scopedPlans = computed(() => plans.value.filter((p) => p.appId === appId))

  function createPlan(input: Omit<import('./useSeedData').Plan, 'id' | 'appId'>) {
    const plan = { ...input, id: `plan-${Date.now()}`, appId }
    plans.value.push(plan)
    return plan
  }
  function updatePlan(id: string, patch: Partial<import('./useSeedData').Plan>) {
    const idx = plans.value.findIndex((p) => p.id === id)
    if (idx !== -1) plans.value[idx] = { ...plans.value[idx], ...patch } as import('./useSeedData').Plan
  }
  function deletePlan(id: string) {
    plans.value = plans.value.filter((p) => p.id !== id)
  }

  return { plans: scopedPlans, createPlan, updatePlan, deletePlan }
}
