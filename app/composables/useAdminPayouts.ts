// app/composables/useAdminPayouts.ts
// Operator-facing payout queue + wallet overview. Deliberately does not use
// useApi() from useApi.ts: that composable reads the tenant token from
// useCookie('auth_token'), and the operator token must never share that key
// (see useAdminAuth.ts). Instead this file talks to the admin API directly
// with $fetch, attaching the admin bearer token itself.
//
// useApi.ts's request() already unwraps the {data, success, message}
// envelope before returning — the equivalent here does the same, so every
// call below is typed with the INNER payload type (e.g. PayoutRequest[]),
// never { data: PayoutRequest[] }.

export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected'

export interface PayoutRequest {
  id: number
  amount_requested: string
  fee_amount: string
  amount_net: string
  destination: string
  status: PayoutStatus
  created_at: string
  wallet: {
    tenant: { id: number; name: string; slug: string }
  }
  requester: { id: number; name: string; email: string }
}

export interface AdminWallet {
  id: number
  environment: 'test' | 'live'
  balance: string
  computed_balance: string
  has_drift: boolean
  currency: string
  tenant: { id: number; name: string; slug: string }
}

export interface WalletsOverview {
  platform_liability: string
  wallets: AdminWallet[]
}

interface Envelope<T> {
  data: T
  success: boolean
  message: string
}

function useAdminApi() {
  const token = useAdminToken()
  const config = useRuntimeConfig()

  function authHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  async function request<T>(path: string, opts: { method?: string; body?: Record<string, unknown> } = {}): Promise<T> {
    const res = await $fetch<Envelope<T>>(`${config.public.apiBaseUrl}/api${path}`, {
      method: (opts.method ?? 'GET') as 'GET',
      headers: authHeaders(),
      body: opts.body,
    })
    // Unwrap here, same as useApi.ts's request() — callers below type with
    // the inner payload, never the envelope.
    return res.data
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: Record<string, unknown>) => request<T>(path, { method: 'POST', body }),
  }
}

export function useAdminPayouts() {
  const api = useAdminApi()

  // useState so the queue is shared across every call site within a
  // request and isolated per-request during SSR (see useAdminAuth.ts for
  // why a bare/module-scope ref would be wrong here).
  const requests = useState<PayoutRequest[]>('admin-payout-requests', () => [])
  const pending = useState('admin-payout-requests-pending', () => false)
  const error = useState<string | null>('admin-payout-requests-error', () => null)
  const statusFilter = useState<PayoutStatus | 'all'>('admin-payout-status-filter', () => 'pending')

  async function fetchPayoutRequests(status: PayoutStatus | 'all' = statusFilter.value) {
    statusFilter.value = status
    pending.value = true
    error.value = null
    try {
      // api.get<T> is typed with the inner array type, not { data: T }.
      const res = await api.get<PayoutRequest[]>(`/admin/payout-requests?status=${status}`)
      requests.value = res
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  async function approve(id: number) {
    await api.post(`/admin/payout-requests/${id}/approve`)
    await fetchPayoutRequests()
  }

  async function reject(id: number, note: string) {
    await api.post(`/admin/payout-requests/${id}/reject`, { note })
    await fetchPayoutRequests()
  }

  async function markPaid(id: number, note: string) {
    await api.post(`/admin/payout-requests/${id}/pay`, { note })
    await fetchPayoutRequests()
  }

  return {
    requests,
    pending,
    error,
    statusFilter,
    fetchPayoutRequests,
    approve,
    reject,
    markPaid,
  }
}

export function useAdminWallets() {
  const api = useAdminApi()

  const wallets = useState<AdminWallet[]>('admin-wallets', () => [])
  const platformLiability = useState<string>('admin-platform-liability', () => '0.00')
  const pending = useState('admin-wallets-pending', () => false)
  const error = useState<string | null>('admin-wallets-error', () => null)

  async function fetchWallets() {
    pending.value = true
    error.value = null
    try {
      const res = await api.get<WalletsOverview>('/admin/wallets')
      wallets.value = res.wallets
      platformLiability.value = res.platform_liability
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  return { wallets, platformLiability, pending, error, fetchWallets }
}
