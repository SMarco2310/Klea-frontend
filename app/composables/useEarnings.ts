// app/composables/useEarnings.ts
export interface Transaction {
  id: number
  subscription_id: number
  amount: number
  currency: string
  provider_tx_id: string | null
  payment_method: string
  phone_number: string
  status: string
  environment: string
  created_at: string
}

export function useEarnings() {
  const api = useApi()
  const { mode } = useEnvMode()
  const { apps } = useApps()
  
  const transactions = ref<Transaction[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  const { balance: walletBalance, fetchWallet } = useWallet()
  const totalBalance = computed(() => Number(walletBalance.value))
  const grossVolume = ref(0)
  const refunded = ref(0) // Assuming refund tracking might be added later, currently 0
  const transactionCount = ref(0)
  const successfulCount = ref(0)
  const avgTransaction = computed(() => transactionCount.value === 0 ? null : grossVolume.value / transactionCount.value)
  const appCount = computed(() => apps.value.length)

  async function fetchEarnings() {
    pending.value = true
    error.value = null
    try {
      const [summaryRes, txRes] = await Promise.all([
        api.get<{ data: { total_amount: number; transaction_count: number } }>(`/transactions/summary?environment=${mode.value}`),
        api.get<Paginated<Transaction>>(`/transactions?environment=${mode.value}`),
        fetchWallet()
      ])

      grossVolume.value = summaryRes.data.total_amount
      successfulCount.value = summaryRes.data.transaction_count
      
      // @ts-expect-error backend returns Paginated, useApi unwraps data envelope but meta is at top level
      // Actually, useApi.get<T> returns `res.data`. If `T` is Paginated, `res.data` is just the `Paginated<T>` object
      // wait, `Paginated<Transaction>` has `.data` for the array and `.meta` for pagination!
      transactions.value = txRes.data
      // @ts-expect-error meta exists on the unwrapped envelope if we defined Paginated correctly
      transactionCount.value = (txRes as any).meta?.total ?? txRes.data.length
      
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  return {
    transactions,
    totalBalance,
    grossVolume,
    refunded,
    avgTransaction,
    transactionCount,
    successfulCount,
    appCount,
    pending,
    error,
    fetchEarnings
  }
}
