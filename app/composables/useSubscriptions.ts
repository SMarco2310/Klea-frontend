// app/composables/useSubscriptions.ts
export function useSubscriptions(appId: string) {
  const { subscriptions } = useSeedData()
  const { mode } = useEnvMode()

  const scoped = computed(() =>
    subscriptions.value.filter((s) => s.appId === appId && s.env === mode.value)
  )

  return { subscriptions: scoped }
}
