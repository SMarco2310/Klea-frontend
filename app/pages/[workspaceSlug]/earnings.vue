<!-- app/pages/earnings.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { WalletIcon, CreditCardIcon, BanknoteIcon, Layers2Icon, ArrowUpFromLineIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { formatCurrency } from '~/utils/format'
import StatCard from '~/components/dashboard/StatCard.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import type { DestinationType } from '~/composables/usePayouts'

const { transactions, totalBalance, grossVolume, refunded, avgTransaction, transactionCount, successfulCount, appCount, fetchEarnings } = useEarnings()
const { mode } = useEnvMode()
const { currency: walletCurrency, withdrawable, balance: walletBalance, entries: walletEntries, fetchWallet } = useWallet()
const { user } = useAppAuth()
const { requests: payoutRequests, fetchPayoutRequests, createPayoutRequest } = usePayouts()

// Same pivot-role lookup team.vue uses for "your role" — the server-side
// PayoutRequestPolicy is the real gate; this only decides whether to show
// the button at all.
const currentRole = computed(
  () => user.value?.tenants?.find((t) => t.id === user.value?.current_tenant_id)?.pivot?.role ?? 'member'
)
const canRequestPayout = computed(() => currentRole.value === 'owner' || currentRole.value === 'admin')

// Balance is a decimal:2 string — compared/guarded as a number only for
// UI gating (disabled state, guard messages), never sent anywhere or
// substituted for the string the server returns.
const balanceIsZero = computed(() => Number(walletBalance.value) <= 0)
const showWithdrawButton = computed(() => withdrawable.value && canRequestPayout.value)

// fetchEarnings only reads mode.value after its first `await`, past the point
// Vue tracks synchronous dependencies inside watchEffect — so watchEffect
// would run once and never react to a test/live toggle. Watch `mode`
// explicitly instead.
watch(mode, () => fetchEarnings(), { immediate: true })

onMounted(fetchPayoutRequests)

// --- Withdraw dialog -------------------------------------------------

const dialogOpen = ref(false)
const destinationType = ref<DestinationType>('mobile_money')
const destination = ref('')
const amount = ref('')
const isSubmitting = ref(false)
const submitError = ref('')

const destinationLabel = computed(() =>
  destinationType.value === 'mobile_money' ? 'Phone number' : 'Account reference'
)
const destinationPlaceholder = computed(() =>
  destinationType.value === 'mobile_money' ? '+228 90 00 00 00' : 'IBAN or bank account reference'
)

function resetForm() {
  destinationType.value = 'mobile_money'
  destination.value = ''
  amount.value = ''
  submitError.value = ''
}

function openDialog() {
  resetForm()
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
}

// Fee preview only — an estimate for the user's benefit while typing. The
// server snapshots the authoritative fee_rate/fee_amount/amount_net at
// request time and rounds once; this is not reproduced here to avoid the
// two disagreeing by a cent. Computed with integer cents (not float
// multiplication of the decimal string) to keep the estimate exact for
// well-formed input, but it is still only a preview.
const FEE_RATE = 0.025

const feePreview = computed(() => {
  const amountCents = parseAmountToCents(amount.value)
  if (amountCents === null || amountCents <= 0) return null

  const feeCents = Math.round(amountCents * FEE_RATE)
  const netCents = amountCents - feeCents

  return {
    feeAmount: formatCents(feeCents),
    netAmount: formatCents(netCents),
  }
})

function parseAmountToCents(value: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return null
  const [whole, frac = ''] = value.trim().split('.')
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, '0'))
  return Number.isFinite(cents) ? cents : null
}

function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}

// Client-side guards — the server is the real boundary (StorePayoutRequestRequest
// + PayoutService), these just spare the developer an obvious round trip.
const validationError = computed(() => {
  const trimmedAmount = amount.value.trim()
  if (!trimmedAmount) return 'Enter an amount.'
  if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount)) return 'Amount must be a number with at most two decimals.'
  if (Number(trimmedAmount) <= 0) return 'Amount must be greater than zero.'
  if (Number(trimmedAmount) > Number(walletBalance.value)) {
    return `Amount cannot exceed your available balance of ${walletBalance.value}.`
  }
  if (!destination.value.trim()) return 'Enter a destination.'
  return null
})

async function handleSubmit() {
  if (validationError.value) {
    submitError.value = validationError.value
    return
  }
  isSubmitting.value = true
  submitError.value = ''
  try {
    await createPayoutRequest({
      amount: amount.value.trim(),
      destination: destination.value.trim(),
      destination_type: destinationType.value,
    })
    // Requesting a payout does not move money — the balance only changes
    // when an operator approves it — but refresh anyway so the page
    // reflects the source of truth rather than assuming nothing changed.
    await fetchWallet()
    closeDialog()
    toast.success('Withdrawal requested. It is pending review — your balance is unchanged until it is approved.')
  } catch (e) {
    // 422s here carry the real reason in `message` (including the available
    // balance on an over-balance refusal) — surfaced as-is, never replaced
    // with a generic string.
    submitError.value = extractApiErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}

const statusLabels: Record<string, string> = {
  pending: 'Pending — awaiting review',
  approved: 'Approved — balance debited, payment on the way',
  paid: 'Paid',
  rejected: 'Rejected',
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-heading text-2xl font-semibold">Earnings</h1>
      <span class="text-sm text-slate-400">{{ mode === 'live' ? 'Live' : 'Test' }} mode</span>
    </div>

    <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 mb-2">
            <WalletIcon class="w-4 h-4" /> Total balance
          </div>
          <div class="text-4xl font-heading font-bold">{{ formatCurrency(totalBalance, walletCurrency) }}</div>
          <div class="text-xs mt-1" :class="withdrawable ? 'text-[var(--color-accent)]' : 'text-yellow-400'">
            {{ withdrawable ? 'Withdrawable' : 'Test balance — not withdrawable' }}
          </div>
        </div>
        <Button
          v-if="showWithdrawButton"
          class="cursor-pointer gap-1 shrink-0"
          :disabled="balanceIsZero"
          @click="openDialog"
        >
          <ArrowUpFromLineIcon class="w-4 h-4" /> Withdraw
        </Button>
      </div>

      <div class="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-[var(--color-border-dark)]">
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-400 mb-1">Gross volume</div>
          <div class="text-xl font-semibold">{{ formatCurrency(grossVolume) }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-400 mb-1">Refunded</div>
          <div class="text-xl font-semibold">{{ formatCurrency(refunded) }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-400 mb-1">Avg. transaction</div>
          <div class="text-xl font-semibold">{{ avgTransaction === null ? '—' : formatCurrency(avgTransaction) }}</div>
        </div>
      </div>
    </div>

    <div v-if="walletEntries.length" class="mt-8">
      <h2 class="font-heading text-lg font-semibold mb-3">Wallet activity</h2>
      <div class="rounded-xl border border-[var(--color-border-dark)] divide-y divide-[var(--color-border-dark)]">
        <div v-for="entry in walletEntries" :key="entry.id" class="flex items-center justify-between px-4 py-3">
          <div>
            <p class="text-sm">{{ entry.description }}</p>
            <p class="text-xs text-[var(--muted-foreground)]">{{ new Date(entry.created_at).toLocaleString() }}</p>
          </div>
          <span
            class="font-mono text-sm"
            :class="entry.type === 'credit' ? 'text-[var(--color-accent)]' : 'text-[var(--muted-foreground)]'"
          >
            {{ entry.type === 'credit' ? '+' : '−' }}{{ entry.amount }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="canRequestPayout" class="mt-8">
      <h2 class="font-heading text-lg font-semibold mb-3">Withdrawal requests</h2>
      <EmptyState
        v-if="payoutRequests.length === 0"
        :icon="ArrowUpFromLineIcon"
        title="No withdrawal requests yet"
        description="Requests you submit will appear here. A pending request does not reserve or reduce your balance."
      />
      <div v-else class="overflow-x-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)]">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead class="border-b border-[var(--color-border-dark)] bg-[var(--color-surface-muted)]">
            <tr>
              <th class="px-4 py-3 font-medium text-slate-300">Date</th>
              <th class="px-4 py-3 font-medium text-slate-300">Requested</th>
              <th class="px-4 py-3 font-medium text-slate-300">Fee</th>
              <th class="px-4 py-3 font-medium text-slate-300">Net</th>
              <th class="px-4 py-3 font-medium text-slate-300">Destination</th>
              <th class="px-4 py-3 font-medium text-slate-300">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--color-border-dark)]">
            <tr v-for="row in payoutRequests" :key="row.id" class="hover:bg-white/5 transition-colors">
              <td class="px-4 py-3 text-slate-400">{{ new Date(row.created_at).toLocaleString() }}</td>
              <!-- Amounts are decimal:2 strings from the API — rendered as-is,
                   never Number()'d or reformatted. -->
              <td class="px-4 py-3 font-mono">{{ row.amount_requested }}</td>
              <td class="px-4 py-3 font-mono text-slate-400">{{ row.fee_amount }}</td>
              <td class="px-4 py-3 font-mono font-medium">{{ row.amount_net }}</td>
              <td class="px-4 py-3 text-slate-300">
                <div>{{ row.destination }}</div>
                <div class="text-xs text-slate-500 capitalize">{{ row.destination_type.replace('_', ' ') }}</div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20': row.status === 'pending',
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20': row.status === 'approved',
                    'bg-green-500/10 text-green-400 border border-green-500/20': row.status === 'paid',
                    'bg-red-500/10 text-red-400 border border-red-500/20': row.status === 'rejected',
                  }"
                >
                  {{ statusLabels[row.status] ?? row.status }}
                </span>
                <div v-if="row.note" class="text-xs text-slate-500 mt-1 max-w-xs">{{ row.note }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-8">
      <StatCard label="Transactions" :value="transactionCount" :icon="CreditCardIcon" />
      <StatCard label="Successful" :value="successfulCount" :icon="BanknoteIcon" />
      <StatCard label="Apps" :value="appCount" :icon="Layers2Icon" />
    </div>

    <h2 class="font-heading text-lg font-semibold mb-4">Recent transactions</h2>
    <EmptyState
      v-if="transactionCount === 0"
      :icon="CreditCardIcon"
      title="No transactions yet"
      description="When end users pay through your apps, earnings will appear here."
    />
    <div v-else class="overflow-x-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-0">
      <table class="w-full text-left text-sm whitespace-nowrap">
        <thead class="border-b border-[var(--color-border-dark)] bg-[var(--color-surface-muted)]">
          <tr>
            <th class="px-4 py-3 font-medium text-slate-300">ID / Date</th>
            <th class="px-4 py-3 font-medium text-slate-300">Amount</th>
            <th class="px-4 py-3 font-medium text-slate-300">Method</th>
            <th class="px-4 py-3 font-medium text-slate-300">Phone</th>
            <th class="px-4 py-3 font-medium text-slate-300">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--color-border-dark)]">
          <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-white/5 transition-colors">
            <td class="px-4 py-3">
              <div class="font-mono text-xs">{{ tx.provider_tx_id || `txn_${tx.id}` }}</div>
              <div class="text-xs text-slate-500">{{ new Date(tx.created_at).toLocaleDateString() }}</div>
            </td>
            <td class="px-4 py-3 font-medium">{{ formatCurrency(tx.amount) }}</td>
            <td class="px-4 py-3 text-slate-300 capitalize">{{ tx.payment_method }}</td>
            <td class="px-4 py-3 text-slate-300">{{ tx.phone_number }}</td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-500/10 text-green-400 border border-green-500/20': tx.status === 'successful',
                  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20': tx.status === 'pending',
                  'bg-red-500/10 text-red-400 border border-red-500/20': tx.status === 'failed'
                }"
              >
                {{ tx.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a withdrawal</DialogTitle>
          <DialogDescription>
            This submits a request for review — it does not move money yet. Your balance changes only once an
            operator approves it.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label>Method</Label>
            <Select v-model="destinationType">
              <SelectTrigger>
                <SelectValue placeholder="Select a method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile_money">Mobile money</SelectItem>
                <SelectItem value="bank_account">Bank account</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="payout-destination">{{ destinationLabel }}</Label>
            <Input id="payout-destination" v-model="destination" :placeholder="destinationPlaceholder" />
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="payout-amount">Amount</Label>
              <span class="text-xs text-slate-400">Available: {{ walletBalance }} {{ walletCurrency }}</span>
            </div>
            <Input id="payout-amount" v-model="amount" placeholder="0.00" inputmode="decimal" />
          </div>
          <div v-if="feePreview" class="text-xs text-slate-400 bg-[var(--color-surface-muted)] rounded-md px-3 py-2">
            Estimate — Fee {{ FEE_RATE * 100 }}%: {{ feePreview.feeAmount }} → You receive: {{ feePreview.netAmount }}
            <span class="block text-slate-500 mt-0.5">The final figures are set when the request is submitted.</span>
          </div>
          <p v-if="submitError" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {{ submitError }}
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" :disabled="isSubmitting" @click="closeDialog">Cancel</Button>
          <Button class="cursor-pointer" :disabled="isSubmitting" @click="handleSubmit">
            {{ isSubmitting ? 'Submitting...' : 'Request withdrawal' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
