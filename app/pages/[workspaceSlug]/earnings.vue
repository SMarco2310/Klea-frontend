<!-- app/pages/earnings.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { WalletIcon, CreditCardIcon, BanknoteIcon, Layers2Icon } from '@lucide/vue'
import { formatCurrency } from '~/utils/format'
import StatCard from '~/components/dashboard/StatCard.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'

const { transactions, totalBalance, grossVolume, refunded, avgTransaction, transactionCount, successfulCount, appCount, fetchEarnings } = useEarnings()
const { mode } = useEnvMode()
const { currency: walletCurrency, withdrawable, entries: walletEntries } = useWallet()

// fetchEarnings only reads mode.value after its first `await`, past the point
// Vue tracks synchronous dependencies inside watchEffect — so watchEffect
// would run once and never react to a test/live toggle. Watch `mode`
// explicitly instead.
watch(mode, () => fetchEarnings(), { immediate: true })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-heading text-2xl font-semibold">Earnings</h1>
      <span class="text-sm text-slate-400">{{ mode === 'live' ? 'Live' : 'Test' }} mode</span>
    </div>

    <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] mb-6">
      <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 mb-2">
        <WalletIcon class="w-4 h-4" /> Total balance
      </div>
      <div class="text-4xl font-heading font-bold">{{ formatCurrency(totalBalance, walletCurrency) }}</div>
      <div class="text-xs mt-1" :class="withdrawable ? 'text-[var(--color-accent)]' : 'text-yellow-400'">
        {{ withdrawable ? 'Withdrawable' : 'Test balance — not withdrawable' }}
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

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
  </div>
</template>
