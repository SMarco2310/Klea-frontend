// app/composables/useEarnings.ts
export function useEarnings() {
  const { apps, subscriptions } = useSeedData()
  const { mode } = useEnvMode()

  const scopedTxns = computed(() => subscriptions.value.filter((s) => s.env === mode.value))

  const grossVolume = computed(() => scopedTxns.value.reduce((sum, s) => sum + s.amount, 0))
  const refunded = computed(() => 0)
  const totalBalance = computed(() => grossVolume.value - refunded.value)
  const transactionCount = computed(() => scopedTxns.value.length)
  const successfulCount = computed(
    () => scopedTxns.value.filter((s) => s.status === 'active').length
  )
  const avgTransaction = computed(() =>
    transactionCount.value === 0 ? null : grossVolume.value / transactionCount.value
  )
  const appCount = computed(() => apps.value.length)

  return {
    totalBalance,
    grossVolume,
    refunded,
    avgTransaction,
    transactionCount,
    successfulCount,
    appCount,
  }
}
