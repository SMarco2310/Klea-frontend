<!-- app/pages/apps/[slug]/analytics.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { UsersIcon, BanknoteIcon, ActivityIcon, TrendingUpIcon } from '@lucide/vue'
import { formatCurrency } from '~/utils/format'
import TheSubTabs from '~/components/layout/TheSubTabs.vue'
import StatCard from '~/components/dashboard/StatCard.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ? String(currentApp.value.id) : '')
const { activeSubs, revenue, transactions, successRate } = useAnalytics(appId.value)

const revenueData = [
  { date: 'Jan', Revenue: 1540 },
  { date: 'Feb', Revenue: 2300 },
  { date: 'Mar', Revenue: 1950 },
  { date: 'Apr', Revenue: 3800 },
  { date: 'May', Revenue: 3200 },
  { date: 'Jun', Revenue: 4100 },
]

const transactionData = [
  { month: 'Jan', Transactions: 110 },
  { month: 'Feb', Transactions: 215 },
  { month: 'Mar', Transactions: 154 },
  { month: 'Apr', Transactions: 340 },
  { month: 'May', Transactions: 290 },
  { month: 'Jun', Transactions: 380 },
]
</script>

<template>
  <div>
    <TheSubTabs />
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard label="Active subs" :value="activeSubs" :icon="UsersIcon" />
      <StatCard label="Revenue" :value="formatCurrency(revenue)" :icon="BanknoteIcon" />
      <StatCard label="Transactions" :value="transactions" :icon="ActivityIcon" />
      <StatCard
        label="Success rate"
        :value="successRate === null ? null : `${successRate}%`"
        :icon="TrendingUpIcon"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-6 rounded-xl bg-surface border border-[var(--color-border-dark)] min-h-64 flex flex-col">
        <h3 class="text-sm font-medium text-slate-300 mb-4">Revenue over time</h3>
        <div v-if="revenue === 0" class="flex-grow flex items-center justify-center">
          <p class="text-sm text-slate-500">No revenue data yet</p>
        </div>
        <div v-else class="flex-grow h-64">
          <AreaChart 
            :data="revenueData" 
            :categories="{ Revenue: { name: 'Revenue', color: '#10b981' } }" 
            :x-formatter="(tick: number) => revenueData[tick]?.date || ''"
            :hide-legend="true"
            :height="256"
          />
        </div>
      </div>
      <div class="p-6 rounded-xl bg-surface border border-[var(--color-border-dark)] min-h-64 flex flex-col">
        <h3 class="text-sm font-medium text-slate-300 mb-4">Transactions</h3>
        <div v-if="transactions === 0" class="flex-grow flex items-center justify-center">
          <p class="text-sm text-slate-500">No data</p>
        </div>
        <div v-else class="flex-grow h-64">
          <BarChart 
            :data="transactionData" 
            :y-axis="['Transactions']" 
            x-axis="month"
            :categories="{ Transactions: { name: 'Transactions', color: '#34d399' } }" 
            :hide-legend="true"
            :height="256"
          />
        </div>
      </div>
      <div class="p-6 rounded-xl bg-surface border border-[var(--color-border-dark)] min-h-64 flex flex-col">
        <h3 class="text-sm font-medium text-slate-300 mb-4">Plan distribution</h3>
        <div class="flex-grow flex items-center justify-center min-h-[200px]">
          <DonutChart 
            :data="[350, 150, 50]" 
            :radius="65"
            :arc-width="20"
            :categories="{ Basic: { name: 'Basic', color: '#10b981' }, Pro: { name: 'Pro', color: '#3b82f6' }, Enterprise: { name: 'Enterprise', color: '#f59e0b' } }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
