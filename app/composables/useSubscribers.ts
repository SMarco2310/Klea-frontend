// app/composables/useSubscribers.ts
export function useSubscribers(appId: string) {
  const { subscribers } = useSeedData()
  const { mode } = useEnvMode()

  const scoped = computed(() =>
    subscribers.value.filter((s) => s.appId === appId && s.env === mode.value)
  )

  function createSubscriber(input: Omit<import('./useSeedData').Subscriber, 'id' | 'appId' | 'joinedAt' | 'env'>) {
    const subscriber: import('./useSeedData').Subscriber = {
      ...input,
      id: `sub-${Date.now()}`,
      appId,
      joinedAt: new Date().toISOString().split('T')[0],
      env: mode.value as 'test' | 'live',
    }
    subscribers.value.push(subscriber)
    return subscriber
  }

  return { subscribers: scoped, createSubscriber }
}
