// app/composables/useSubscribers.ts
export function useSubscribers(appId: string) {
  const { subscribers } = useSeedData()
  const { mode } = useEnvMode()

  const scoped = computed(() =>
    subscribers.value.filter((s) => s.appId === appId && s.env === mode.value)
  )

  return { subscribers: scoped }
}
