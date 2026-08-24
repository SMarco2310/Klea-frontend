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
  const paidCount = ref(0)
  const freeSignupCount = ref(0)
  const avgTransaction = computed(() => transactionCount.value === 0 ? null : grossVolume.value / transactionCount.value)
  const appCount = computed(() => apps.value.length)

  async function fetchEarnings() {
    pending.value = true
    error.value = null
    try {
      const [summaryRes, txRes] = await Promise.all([
        // api.get<T> already unwraps the {data, success, message} envelope
        // (see useApi.ts request()), so T is the summary payload itself.
        api.get<{
          total_amount: number
          transaction_count: number
          paid_transaction_count: number
          free_signup_count: number
        }>(`/transactions/summary?environment=${mode.value}`),
        api.get<Paginated<Transaction>>(`/transactions?environment=${mode.value}`),
        fetchWallet()
      ])

      grossVolume.value = summaryRes.total_amount
      successfulCount.value = summaryRes.transaction_count
      // Free signups are real customers that brought no money. Shown apart from
      // paid conversions so neither number misleads.
      paidCount.value = summaryRes.paid_transaction_count ?? summaryRes.transaction_count
      freeSignupCount.value = summaryRes.free_signup_count ?? 0

      // txRes is the unwrapped Paginated<Transaction> envelope: `.data` holds the
      // rows, `.meta.total` holds the server-side row count.
      transactions.value = txRes.data
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
    paidCount,
    freeSignupCount,
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
