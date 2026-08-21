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

  // useState (not module-scope ref) so the wallet state is shared across every
  // call site within a request, and isolated per-request during SSR — a plain
  // module-level ref would leak one user's balance into another user's render.
  const balance = useState('wallet-balance', () => '0.00')
  const currency = useState('wallet-currency', () => 'XOF')
  const withdrawable = useState('wallet-withdrawable', () => false)
  const entries = useState<WalletEntry[]>('wallet-entries', () => [])
  const pending = useState('wallet-pending', () => false)
  const error = useState<string | null>('wallet-error', () => null)

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
