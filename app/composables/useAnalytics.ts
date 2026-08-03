// app/composables/useAnalytics.ts
export function useAnalytics(appId: string) {
  const { subscriptions } = useSubscriptions(appId)
  const { subscribers } = useSubscribers(appId)

  const activeSubs = computed(
    () => subscribers.value.filter((s) => s.status === 'active').length
  )
  const revenue = computed(() =>
    subscriptions.value.reduce((sum, s) => sum + s.amount, 0)
  )
  const transactions = computed(() => subscriptions.value.length)
  const successRate = computed(() => {
    if (transactions.value === 0) return null
    const successful = subscriptions.value.filter((s) => s.status === 'active').length
    return Math.round((successful / transactions.value) * 100)
  })

  return { activeSubs, revenue, transactions, successRate }
}
