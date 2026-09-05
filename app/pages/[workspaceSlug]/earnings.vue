<!-- app/pages/earnings.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { WalletIcon, CreditCardIcon, BanknoteIcon, Layers2Icon, UsersIcon, ArrowUpFromLineIcon } from '@lucide/vue'
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

const { transactions, totalBalance, grossVolume, refunded, avgTransaction, transactionCount, paidCount, freeSignupCount, appCount, fetchEarnings } = useEarnings()
const { mode } = useEnvMode()
const { currency: walletCurrency, withdrawable, balance: walletBalance, entries: walletEntries, fetchWallet } = useWallet()
const { user } = useAppAuth()
const { requests: payoutRequests, fetchPayoutRequests, createPayoutRequest } = usePayouts()
const { t } = useI18n()

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
  destinationType.value === 'mobile_money'
    ? t('earnings.withdraw_dialog.phoneNumberLabel')
    : t('earnings.withdraw_dialog.accountReferenceLabel')
)
const destinationPlaceholder = computed(() =>
  destinationType.value === 'mobile_money' ? '+228 90 00 00 00' : t('earnings.withdraw_dialog.accountReferencePlaceholder')
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
  if (!trimmedAmount) return t('earnings.withdraw_dialog.errors.enterAmount')
  if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount)) return t('earnings.withdraw_dialog.errors.invalidAmount')
  if (Number(trimmedAmount) <= 0) return t('earnings.withdraw_dialog.errors.notPositive')
  if (Number(trimmedAmount) > Number(walletBalance.value)) {
    return t('earnings.withdraw_dialog.errors.exceedsBalance', { balance: walletBalance.value })
  }
  if (!destination.value.trim()) return t('earnings.withdraw_dialog.errors.enterDestination')
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
    toast.success(t('earnings.withdraw_dialog.successToast'))
  } catch (e) {
    // 422s here carry the real reason in `message` (including the available
    // balance on an over-balance refusal) — surfaced as-is, never replaced
    // with a generic string.
    submitError.value = extractApiErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}

// Plain (non-computed) string maps do not re-evaluate on locale switch, so
// these are computed even though their shape never changes.
const statusLabels = computed<Record<string, string>>(() => ({
  pending: t('earnings.status.pending'),
  approved: t('earnings.status.approved'),
  paid: t('earnings.status.paid'),
  rejected: t('earnings.status.rejected'),
}))

const destinationTypeLabels = computed<Record<string, string>>(() => ({
  mobile_money: t('earnings.destinationType.mobile_money'),
  bank_account: t('earnings.destinationType.bank_account'),
}))
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-heading text-2xl font-semibold">{{ $t('earnings.title') }}</h1>
      <span class="text-sm text-slate-400">{{ $t('common.modeSuffix', { mode: mode === 'live' ? $t('nav.liveMode') : $t('nav.testMode') }) }}</span>
    </div>

    <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 mb-2">
            <WalletIcon class="w-4 h-4" /> {{ $t('earnings.totalBalance') }}
          </div>
          <div class="text-4xl font-heading font-bold">{{ formatCurrency(totalBalance, walletCurrency) }}</div>
          <div class="text-xs mt-1" :class="withdrawable ? 'text-[var(--color-accent)]' : 'text-yellow-400'">
            {{ withdrawable ? $t('earnings.withdrawable') : $t('earnings.notWithdrawable') }}
          </div>
        </div>
        <Button
          v-if="showWithdrawButton"
          class="cursor-pointer gap-1 shrink-0"
          :disabled="balanceIsZero"
          @click="openDialog"
        >
          <ArrowUpFromLineIcon class="w-4 h-4" /> {{ $t('earnings.withdraw') }}
        </Button>
      </div>

      <div class="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-[var(--color-border-dark)]">
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-400 mb-1">{{ $t('earnings.grossVolume') }}</div>
          <div class="text-xl font-semibold">{{ formatCurrency(grossVolume) }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-400 mb-1">{{ $t('earnings.refunded') }}</div>
          <div class="text-xl font-semibold">{{ formatCurrency(refunded) }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-400 mb-1">{{ $t('earnings.avgTransaction') }}</div>
          <div class="text-xl font-semibold">{{ avgTransaction === null ? '—' : formatCurrency(avgTransaction) }}</div>
        </div>
      </div>
    </div>

    <div v-if="walletEntries.length" class="mt-8">
      <h2 class="font-heading text-lg font-semibold mb-3">{{ $t('earnings.walletActivity') }}</h2>
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
      <h2 class="font-heading text-lg font-semibold mb-3">{{ $t('earnings.withdrawalRequests') }}</h2>
      <EmptyState
        v-if="payoutRequests.length === 0"
        :icon="ArrowUpFromLineIcon"
        :title="$t('earnings.noRequestsTitle')"
        :description="$t('earnings.noRequestsDescription')"
      />
      <div v-else class="overflow-x-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)]">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead class="border-b border-[var(--color-border-dark)] bg-[var(--color-surface-muted)]">
            <tr>
              <th class="px-4 py-3 font-medium text-slate-300">{{ $t('earnings.table.date') }}</th>
              <th class="px-4 py-3 font-medium text-slate-300">{{ $t('earnings.table.requested') }}</th>
              <th class="px-4 py-3 font-medium text-slate-300">{{ $t('earnings.table.fee') }}</th>
              <th class="px-4 py-3 font-medium text-slate-300">{{ $t('earnings.table.net') }}</th>
              <th class="px-4 py-3 font-medium text-slate-300">{{ $t('earnings.table.destination') }}</th>
              <th class="px-4 py-3 font-medium text-slate-300">{{ $t('earnings.table.status') }}</th>
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
                <div class="text-xs text-slate-500 capitalize">{{ destinationTypeLabels[row.destination_type] ?? row.destination_type.replace('_', ' ') }}</div>
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

    <!-- Paid and free are shown apart: a free signup is a real customer but
         moved no money, so folding it into "Paid" would overstate conversions
         and hiding it would undercount the customer base. -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-8">
      <StatCard :label="$t('earnings.statTransactions')" :value="transactionCount" :icon="CreditCardIcon" />
      <StatCard :label="$t('earnings.statPaid')" :value="paidCount" :icon="BanknoteIcon" />
      <StatCard :label="$t('earnings.statFreeSignups')" :value="freeSignupCount" :icon="UsersIcon" />
      <StatCard :label="$t('earnings.statApps')" :value="appCount" :icon="Layers2Icon" />
    </div>

    <h2 class="font-heading text-lg font-semibold mb-4">{{ $t('earnings.recentTransactions') }}</h2>
    <EmptyState
      v-if="transactionCount === 0"
      :icon="CreditCardIcon"
      :title="$t('earnings.noTransactionsTitle')"
      :description="$t('earnings.noTransactionsDescription')"
    />
    <div v-else class="overflow-x-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-0">
      <table class="w-full text-left text-sm whitespace-nowrap">
        <thead class="border-b border-[var(--color-border-dark)] bg-[var(--color-surface-muted)]">
          <tr>
            <th class="px-4 py-3 font-medium text-slate-300">{{ $t('earnings.txTable.idDate') }}</th>
            <th class="px-4 py-3 font-medium text-slate-300">{{ $t('earnings.txTable.amount') }}</th>
            <th class="px-4 py-3 font-medium text-slate-300">{{ $t('earnings.txTable.method') }}</th>
            <th class="px-4 py-3 font-medium text-slate-300">{{ $t('earnings.txTable.phone') }}</th>
            <th class="px-4 py-3 font-medium text-slate-300">{{ $t('earnings.txTable.status') }}</th>
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
          <DialogTitle>{{ $t('earnings.withdraw_dialog.title') }}</DialogTitle>
          <DialogDescription>
            {{ $t('earnings.withdraw_dialog.description') }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label>{{ $t('earnings.withdraw_dialog.method') }}</Label>
            <Select v-model="destinationType">
              <SelectTrigger>
                <SelectValue :placeholder="$t('earnings.withdraw_dialog.selectMethodPlaceholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile_money">{{ $t('earnings.destinationType.mobile_money') }}</SelectItem>
                <SelectItem value="bank_account">{{ $t('earnings.destinationType.bank_account') }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="payout-destination">{{ destinationLabel }}</Label>
            <Input id="payout-destination" v-model="destination" :placeholder="destinationPlaceholder" />
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="payout-amount">{{ $t('earnings.withdraw_dialog.amount') }}</Label>
              <span class="text-xs text-slate-400">{{ $t('earnings.withdraw_dialog.available', { balance: walletBalance, currency: walletCurrency }) }}</span>
            </div>
            <Input id="payout-amount" v-model="amount" placeholder="0.00" inputmode="decimal" />
          </div>
          <div v-if="feePreview" class="text-xs text-slate-400 bg-[var(--color-surface-muted)] rounded-md px-3 py-2">
            {{ $t('earnings.withdraw_dialog.feeEstimate', { rate: FEE_RATE * 100, fee: feePreview.feeAmount, net: feePreview.netAmount }) }}
            <span class="block text-slate-500 mt-0.5">{{ $t('earnings.withdraw_dialog.feeFinalNote') }}</span>
          </div>
          <p v-if="submitError" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {{ submitError }}
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" :disabled="isSubmitting" @click="closeDialog">{{ $t('common.cancel') }}</Button>
          <Button class="cursor-pointer" :disabled="isSubmitting" @click="handleSubmit">
            {{ isSubmitting ? $t('earnings.withdraw_dialog.submitting') : $t('earnings.withdraw_dialog.requestWithdrawal') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
