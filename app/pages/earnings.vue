<!-- app/pages/earnings.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { WalletIcon, CreditCardIcon, DollarSignIcon, Layers2Icon } from '@lucide/vue'
import { formatCurrency } from '~/utils/format'
import StatCard from '~/components/dashboard/StatCard.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'

const { totalBalance, grossVolume, refunded, avgTransaction, transactionCount, successfulCount, appCount } = useEarnings()
const { mode } = useEnvMode()
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
      <div class="text-4xl font-heading font-bold">{{ formatCurrency(totalBalance) }}</div>
      <div class="text-xs text-[var(--color-accent)] mt-1">All-time net</div>

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

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <StatCard label="Transactions" :value="transactionCount" :icon="CreditCardIcon" />
      <StatCard label="Successful" :value="successfulCount" :icon="DollarSignIcon" />
      <StatCard label="Apps" :value="appCount" :icon="Layers2Icon" />
    </div>

    <h2 class="font-heading text-lg font-semibold mb-4">Recent transactions</h2>
    <EmptyState
      v-if="transactionCount === 0"
      :icon="CreditCardIcon"
      title="No transactions yet"
      description="When end users pay through your apps, earnings will appear here."
    />
  </div>
</template>
