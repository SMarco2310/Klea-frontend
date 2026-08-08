<!-- app/pages/apps/[slug]/analytics.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { UsersIcon, BanknoteIcon, ActivityIcon, TrendingUpIcon, ReceiptIcon } from '@lucide/vue'
import { formatCurrency, formatDate } from '~/utils/format'
import StatCard from '~/components/dashboard/StatCard.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)
const {
  activeSubs,
  revenue,
  transactions,
  successRate,
  revenueTrend,
  subscriptionTrend,
  revenueDelta,
  subscriptionsDelta,
  planDistribution,
  recentSubscriptions,
  pending,
  fetchAnalytics,
} = useAnalytics(appId.value)

watchEffect(() => {
  if (appId.value) fetchAnalytics()
})

// Cycled across whatever plans this app actually has — not a fixed
// Basic/Pro/Enterprise set.
const PLAN_COLORS = ['#7fb894', '#d4a574', '#38bdf8', '#a78bfa', '#f472b6']
const planCategories = computed(() => {
  const cats: Record<string, { name: string; color: string }> = {}
  planDistribution.value.forEach((p, i) => {
    cats[p.name] = { name: p.name, color: PLAN_COLORS[i % PLAN_COLORS.length]! }
  })
  return cats
})
const planCounts = computed(() => planDistribution.value.map((p) => p.count))
</script>

<template>
  <div class="flex flex-col min-h-[calc(100vh-14rem)]">
    <AppHeader title="Analytics" subtitle="Overview of your app's performance" />

    <p v-if="pending" class="text-sm text-slate-400 mb-4">Loading analytics...</p>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 shrink-0">
      <StatCard label="Active subs" :value="activeSubs" :icon="UsersIcon" :trend="subscriptionTrend" :delta="subscriptionsDelta" />
      <StatCard label="Revenue" :value="revenue > 0 ? `+${formatCurrency(revenue)}` : formatCurrency(revenue)" :icon="BanknoteIcon" :trend="revenueTrend" :delta="revenueDelta" :valueClass="revenue > 0 ? 'text-emerald-400' : ''" />
      <StatCard label="Transactions" :value="transactions" :icon="ActivityIcon" />
      <StatCard
        label="Success rate"
        :value="successRate === null ? null : `${successRate}%`"
        :icon="TrendingUpIcon"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] h-full min-h-[320px] flex flex-col">
        <h3 class="text-sm font-medium text-slate-300 mb-4">Revenue over time</h3>
        <div v-if="revenueTrend.length === 0" class="flex-grow flex items-center justify-center">
          <p class="text-sm text-slate-500">No revenue data yet</p>
        </div>
        <div v-else class="flex-grow h-56">
          <AreaChart
            :data="revenueTrend"
            :categories="{ amount: { name: 'Revenue', color: '#7fb894' } }"
            :x-formatter="(tick: number) => revenueTrend[tick]?.date || ''"
            :hide-legend="true"
            :height="224"
          />
        </div>
      </div>
      <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] h-full min-h-[320px] flex flex-col">
        <h3 class="text-sm font-medium text-slate-300 mb-4">Subscriptions</h3>
        <div v-if="subscriptionTrend.length === 0" class="flex-grow flex items-center justify-center">
          <p class="text-sm text-slate-500">No data</p>
        </div>
        <div v-else class="flex-grow h-56">
          <BarChart
            :data="subscriptionTrend"
            :y-axis="['amount']"
            x-axis="date"
            :categories="{ amount: { name: 'Subscriptions', color: '#38bdf8' } }"
            :hide-legend="true"
            :height="224"
          />
        </div>
      </div>
      <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] h-full min-h-[320px] flex flex-col">
        <h3 class="text-sm font-medium text-slate-300 mb-4">Plan distribution</h3>
        <div v-if="planCounts.length === 0" class="flex-grow flex items-center justify-center min-h-[200px]">
          <p class="text-sm text-slate-500">No active subscriptions yet</p>
        </div>
        <div v-else class="flex-grow flex items-center justify-center min-h-[200px]">
          <DonutChart :data="planCounts" :radius="65" :arc-width="20" :categories="planCategories" />
        </div>
      </div>
    </div>

    <div class="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-5">
      <h3 class="text-sm font-medium text-slate-300 mb-4">Recent subscriptions</h3>
      <EmptyState
        v-if="recentSubscriptions.length === 0"
        :icon="ReceiptIcon"
        title="No subscriptions yet"
        description="New subscriptions will show up here as soon as someone subscribes through your app."
      />
      <div v-else class="divide-y divide-[var(--color-border-dark)]">
        <div
          v-for="sub in recentSubscriptions"
          :key="sub.id"
          class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-8 h-8 rounded-md bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
              <ReceiptIcon class="w-4 h-4 text-[var(--color-accent)]" />
            </span>
            <div class="min-w-0">
              <div class="font-medium text-sm truncate">{{ sub.subscriber?.email ?? '—' }}</div>
              <div class="text-xs text-slate-400">{{ sub.plan?.name ?? '—' }} · {{ formatDate(sub.created_at) }}</div>
            </div>
          </div>
          <span
            class="text-xs font-medium px-2.5 py-0.5 rounded-full capitalize shrink-0"
            :class="
              sub.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            "
          >{{ sub.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
