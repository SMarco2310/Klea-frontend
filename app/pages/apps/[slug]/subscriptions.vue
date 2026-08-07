<!-- app/pages/apps/[slug]/subscriptions.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { ReceiptIcon } from '@lucide/vue'
import { formatCurrency, formatDate } from '~/utils/format'
import TheSubTabs from '~/components/layout/TheSubTabs.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import DataTable from '~/components/dashboard/DataTable.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ? String(currentApp.value.id) : '')
const { subscriptions } = useSubscriptions(appId.value)
const { subscribers } = useSubscribers(appId.value)
const { plans } = usePlans(appId.value)

function getSubscriberEmail(subscriberId: string) {
  const sub = subscribers.value.find((s) => s.id === subscriberId)
  return sub?.email || subscriberId || '—'
}

function getPlanName(planId: string) {
  const plan = plans.value.find((p) => p.id === planId)
  return plan?.name || '—'
}

const columns = [
  { key: 'email', label: 'Subscriber Email' },
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' },
  { key: 'createdAt', label: 'Created' },
]
</script>

<template>
  <div>
    <TheSubTabs />
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm text-slate-400">{{ subscriptions.length }} subscription{{ subscriptions.length === 1 ? '' : 's' }}</span>
    </div>
    <EmptyState
      v-if="subscriptions.length === 0"
      :icon="ReceiptIcon"
      title="No subscriptions"
      description="Subscriptions are created automatically when end users pay through your app."
    />
    <div v-else class="overflow-x-auto">
      <DataTable :columns="columns" :rows="subscriptions">
        <template #cell-email="{ row }">
          <span class="font-medium text-slate-100">{{ getSubscriberEmail(row.subscriberId as string) }}</span>
        </template>
        <template #cell-plan="{ row }">
          <span class="text-slate-300 font-mono text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60">
            {{ getPlanName(row.planId as string) }}
          </span>
        </template>
        <template #cell-status="{ row }">
          <span
            class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
            :class="
              row.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            "
          >
            {{ row.status }}
          </span>
        </template>
        <template #cell-amount="{ row }">{{ formatCurrency(row.amount as number) }}</template>
        <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt as string) }}</template>
      </DataTable>
    </div>
  </div>
</template>
