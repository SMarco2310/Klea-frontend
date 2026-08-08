<!-- app/pages/apps/[slug]/subscriptions.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { ReceiptIcon } from '@lucide/vue'
import { formatCurrency, formatDate } from '~/utils/format'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import DataTable from '~/components/dashboard/DataTable.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)
const { subscriptions, pending, fetchSubscriptions } = useSubscriptions(appId.value)

watchEffect(() => {
  if (appId.value) fetchSubscriptions()
})

const columns = [
  { key: 'email', label: 'Subscriber Email' },
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' },
  { key: 'starts_at', label: 'Started' },
]

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  expired: 'bg-slate-800 text-slate-400 border border-slate-700',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
}
</script>

<template>
  <div>
    <AppHeader title="Subscriptions" :subtitle="`${subscriptions.length} subscription${subscriptions.length === 1 ? '' : 's'}`" />
    <p v-if="pending" class="text-sm text-slate-400 mb-4">Loading subscriptions...</p>
    <div v-else-if="subscriptions.length === 0" class="flex flex-col items-center justify-center">
      <EmptyState
        :icon="ReceiptIcon"
        title="No subscriptions"
        description="Subscriptions are created automatically when end users subscribe through your app."
        class="w-full"
      />
    </div>
    <div v-else class="overflow-x-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-4 min-h-[calc(100vh-16rem)]">
      <DataTable :columns="columns" :rows="subscriptions">
        <template #cell-email="{ row }">
          <span class="font-medium text-slate-100">{{ row.subscriber?.email ?? '—' }}</span>
        </template>
        <template #cell-plan="{ row }">
          <span class="text-slate-300 font-mono text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60">
            {{ row.plan?.name ?? '—' }}
          </span>
        </template>
        <template #cell-status="{ row }">
          <span
            class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
            :class="STATUS_STYLES[row.status as string] ?? STATUS_STYLES.expired"
          >
            {{ row.status }}
          </span>
        </template>
        <template #cell-amount="{ row }">
          {{ row.plan ? formatCurrency(row.plan.price, row.plan.currency) : '—' }}
        </template>
        <template #cell-starts_at="{ row }">{{ formatDate(row.starts_at as string) }}</template>
      </DataTable>
    </div>
  </div>
</template>
