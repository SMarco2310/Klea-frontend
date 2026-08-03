<!-- app/pages/apps/[slug]/subscriptions.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { ReceiptIcon } from '@lucide/vue'
import { formatCurrency, formatDate } from '~/utils/format'
import TheSubTabs from '~/components/layout/TheSubTabs.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import DataTable from '~/components/dashboard/DataTable.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? '')
const { subscriptions } = useSubscriptions(appId.value)

const columns = [
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
        <template #cell-amount="{ row }">{{ formatCurrency(row.amount as number) }}</template>
        <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt as string) }}</template>
      </DataTable>
    </div>
  </div>
</template>
