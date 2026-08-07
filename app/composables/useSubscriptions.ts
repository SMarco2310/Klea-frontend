// app/composables/useSubscriptions.ts
export function useSubscriptions(appId: string) {
  const { subscriptions } = useSeedData()
  const { mode } = useEnvMode()

  const scoped = computed(() =>
    subscriptions.value.filter((s) => s.appId === appId && s.env === mode.value)
  )

  function createSubscription(input: Omit<import('./useSeedData').Subscription, 'id' | 'appId' | 'createdAt' | 'env'>) {
    const subscription: import('./useSeedData').Subscription = {
      ...input,
      id: `txn-${Date.now()}`,
      appId,
      createdAt: new Date().toISOString().split('T')[0],
      env: mode.value as 'test' | 'live',
    }
    subscriptions.value.push(subscription)
    return subscription
  }

  return { subscriptions: scoped, createSubscription }
}
