<!-- app/pages/apps/[slug]/analytics.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { UsersIcon, DollarSignIcon, ActivityIcon, TrendingUpIcon } from '@lucide/vue'
import { formatCurrency } from '~/utils/format'
import TheSubTabs from '~/components/layout/TheSubTabs.vue'
import StatCard from '~/components/dashboard/StatCard.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? '')
const { activeSubs, revenue, transactions, successRate } = useAnalytics(appId.value)
</script>

<template>
  <div>
    <TheSubTabs />
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard label="Active subs" :value="activeSubs" :icon="UsersIcon" />
      <StatCard label="Revenue" :value="formatCurrency(revenue)" :icon="DollarSignIcon" />
      <StatCard label="Transactions" :value="transactions" :icon="ActivityIcon" />
      <StatCard
        label="Success rate"
        :value="successRate === null ? null : `${successRate}%`"
        :icon="TrendingUpIcon"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] min-h-64 flex items-center justify-center">
        <p v-if="revenue === 0" class="text-sm text-slate-500">No revenue data yet</p>
        <p v-else class="text-sm text-slate-500">Revenue over time (chart placeholder)</p>
      </div>
      <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] min-h-64 flex items-center justify-center">
        <p v-if="transactions === 0" class="text-sm text-slate-500">No data</p>
        <p v-else class="text-sm text-slate-500">Plan distribution (chart placeholder)</p>
      </div>
    </div>
  </div>
</template>
