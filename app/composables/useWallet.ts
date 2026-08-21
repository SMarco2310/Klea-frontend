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
  //
  // Not keyed per environment: useState's key is a plain string evaluated
  // once when useWallet() runs, and both call sites (useEarnings.ts,
  // earnings.vue) call useWallet() a single time at component setup — a key
  // built from mode.value at that instant would freeze to whatever mode was
  // active on first render and never track later toggles. Instead,
  // fetchWallet() resets state to defaults before every request, so a
  // test/live toggle (which re-triggers fetchWallet via the mode watcher in
  // earnings.vue) always clears the previous environment's balance before
  // the new one loads, rather than briefly showing stale data under the
  // wrong label.
  const balance = useState('wallet-balance', () => '0.00')
  const currency = useState('wallet-currency', () => 'XOF')
  const withdrawable = useState('wallet-withdrawable', () => false)
  const entries = useState<WalletEntry[]>('wallet-entries', () => [])
  const pending = useState('wallet-pending', () => false)
  const error = useState<string | null>('wallet-error', () => null)

  async function fetchWallet() {
    pending.value = true
    error.value = null
    // Reset to defaults up front so a mode toggle never shows the previous
    // environment's balance/entries under the new mode's label while the
    // new request is in flight or if it fails.
    balance.value = '0.00'
    currency.value = 'XOF'
    withdrawable.value = false
    entries.value = []
    try {
      // api.get<T> already unwraps the {data, success, message} envelope
      // (see useApi.ts request()), so T is the wallet payload itself, not
      // { data: WalletState }.
      const res = await api.get<WalletState>(`/wallet?environment=${mode.value}`)
      balance.value = res.balance
      currency.value = res.currency
      withdrawable.value = res.withdrawable
      entries.value = res.entries ?? []
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  return { balance, currency, withdrawable, entries, pending, error, fetchWallet }
}
