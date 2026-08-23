// app/composables/usePayouts.ts
export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected'
export type DestinationType = 'mobile_money' | 'bank_account'

export interface PayoutRequestRecord {
  id: number
  // decimal:2 columns — strings over the wire, never numbers.
  amount_requested: string
  fee_rate: string
  fee_amount: string
  amount_net: string
  status: PayoutStatus
  destination: string
  destination_type: DestinationType
  note: string | null
  created_at: string
}

export function usePayouts() {
  const api = useApi()

  // useState, not a bare ref: two call sites (the dialog and the list) must
  // see the same data, and a module-scope ref would leak between SSR requests.
  const requests = useState<PayoutRequestRecord[]>('payout-requests', () => [])
  const pending = useState('payout-requests-pending', () => false)
  const error = useState<string | null>('payout-requests-error', () => null)

  async function fetchPayoutRequests() {
    pending.value = true
    error.value = null
    try {
      // api.get already unwraps the {data, success, message} envelope.
      requests.value = (await api.get<PayoutRequestRecord[]>('/payout-requests')) ?? []
    } catch (e) {
      error.value = extractApiErrorMessage(e)
    } finally {
      pending.value = false
    }
  }

  async function createPayoutRequest(payload: {
    amount: string
    destination: string
    destination_type: DestinationType
  }): Promise<PayoutRequestRecord> {
    // Deliberately NOT caught here: the dialog needs the 422 message (which
    // carries the available balance on an over-balance refusal) to show it
    // against the right field.
    const created = await api.post<PayoutRequestRecord>('/payout-requests', payload)
    await fetchPayoutRequests()

    return created
  }

  return { requests, pending, error, fetchPayoutRequests, createPayoutRequest }
}
