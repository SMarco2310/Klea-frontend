// app/composables/useWallet.ts
export interface WalletEntry {
  id: number
  type: 'credit' | 'debit' | 'fee' | 'adjustment'
  amount: string
  balance_after: string
  description: string
  created_at: string
}

export interface WalletState {
  environment: 'test' | 'live'
  balance: string
  currency: string
  withdrawable: boolean
  entries: WalletEntry[]
}

export function useWallet() {
  const api = useApi()
  const { mode } = useEnvMode()

  const balance = ref('0.00')
  const currency = ref('XOF')
  const withdrawable = ref(false)
  const entries = ref<WalletEntry[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchWallet() {
    pending.value = true
    error.value = null
    try {
      const res = await api.get<{ data: WalletState }>(`/wallet?environment=${mode.value}`)
      balance.value = res.data.balance
      currency.value = res.data.currency
      withdrawable.value = res.data.withdrawable
      entries.value = res.data.entries
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  return { balance, currency, withdrawable, entries, pending, error, fetchWallet }
}
