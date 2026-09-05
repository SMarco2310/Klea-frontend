<!-- app/pages/apps/[slug]/analytics.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { UsersIcon, BanknoteIcon, ActivityIcon, TrendingUpIcon, ReceiptIcon } from '@lucide/vue'
import { formatCurrency, formatDate } from '~/utils/format'
import StatCard from '~/components/dashboard/StatCard.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import DonutBreakdown from '~/components/dashboard/DonutBreakdown.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)
const timeRange = ref(30)
const { continueTourInAppIfFlagged } = useTour()
const { t } = useI18n()

onMounted(() => {
  continueTourInAppIfFlagged()
})
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
} = useAnalytics(appId.value, timeRange)

watchEffect(() => {
  if (appId.value) fetchAnalytics()
})

// Cycled across whatever plans this app actually has — not a fixed
// Basic/Pro/Enterprise set.
// Saturated and hue-separated so adjacent slices stay distinguishable — the
// previous muted green/tan pair read as one washed-out band on a dark card.
const PLAN_COLORS = ['#10b981', '#f59e0b', '#38bdf8', '#a78bfa', '#f472b6']
const planCategories = computed(() => {
  const cats: Record<string, { name: string; color: string }> = {}
  planDistribution.value.forEach((p, i) => {
    cats[p.name] = { name: p.name, color: PLAN_COLORS[i % PLAN_COLORS.length]! }
  })
  return cats
})
const planCounts = computed(() => planDistribution.value.map((p) => p.count))

const transactionStatusCounts = computed(() => {
  const active = activeSubs.value
  const pendingCount = transactions.value - active
  if (active === 0 && pendingCount === 0) return []
  return [active, pendingCount]
})

const transactionCategories = computed(() => ({
  Succeeded: { name: t('analytics.transactionStatus.succeeded'), color: '#10b981' },
  Pending: { name: t('analytics.transactionStatus.pending'), color: '#64748b' }
}))

// Plain (non-computed) string maps do not re-evaluate on locale switch.
const subscriptionStatusLabels = computed<Record<string, string>>(() => ({
  active: t('subscriptions.status.active'),
  expired: t('subscriptions.status.expired'),
  cancelled: t('subscriptions.status.cancelled'),
}))
</script>

<template>
  <div class="flex flex-col min-h-[calc(100vh-14rem)]">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <AppHeader :title="$t('nav.analytics')" :subtitle="$t('analytics.subtitle')" />
      <div class="flex bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-lg p-1 shrink-0">
        <button
          v-for="range in [7, 30, 90]"
          :key="range"
          class="px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all duration-200"
          :class="timeRange === range ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--color-hover)]'"
          @click="timeRange = range"
        >
          {{ $t('analytics.lastNDays', { days: range }) }}
        </button>
      </div>
    </div>

    <p v-if="pending" class="text-sm text-slate-400 mb-4 mt-4">{{ $t('analytics.loading') }}</p>
    <div v-else class="mb-4 mt-4" />

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 shrink-0">
      <StatCard :label="$t('analytics.stats.activeSubs')" :value="activeSubs" :icon="UsersIcon" :trend="subscriptionTrend" :delta="subscriptionsDelta" />
      <StatCard :label="$t('analytics.stats.revenue')" :value="revenue > 0 ? `+${formatCurrency(revenue)}` : formatCurrency(revenue)" :icon="BanknoteIcon" :trend="revenueTrend" :delta="revenueDelta" :valueClass="revenue > 0 ? 'text-emerald-400' : ''" />
      <StatCard :label="$t('analytics.stats.transactions')" :value="transactions" :icon="ActivityIcon" />
      <StatCard
        :label="$t('analytics.stats.successRate')"
        :value="successRate === null ? null : `${successRate}%`"
        :icon="TrendingUpIcon"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] h-full min-h-[320px] flex flex-col">
        <h3 class="text-sm font-medium text-slate-300 mb-4">{{ $t('analytics.charts.revenueOverTime') }}</h3>
        <div v-if="revenueTrend.length === 0" class="flex-grow flex items-center justify-center">
          <p class="text-sm text-slate-500">{{ $t('analytics.charts.noRevenueData') }}</p>
        </div>
        <div v-else class="flex-grow h-56">
          <AreaChart
            :data="revenueTrend"
            :categories="{ amount: { name: $t('analytics.stats.revenue'), color: '#34d399' } }"
            :x-formatter="(tick: number) => revenueTrend[tick]?.date || ''"
            :hide-legend="true"
            :y-grid-line="true"
            :x-grid-line="false"
            :height="224"
          />
        </div>
      </div>
      <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] h-full min-h-[320px] flex flex-col">
        <h3 class="text-sm font-medium text-slate-300 mb-4">{{ $t('nav.subscriptions') }}</h3>
        <div v-if="subscriptionTrend.length === 0" class="flex-grow flex items-center justify-center">
          <p class="text-sm text-slate-500">{{ $t('analytics.charts.noData') }}</p>
        </div>
        <div v-else class="flex-grow h-56">
          <BarChart
            :data="subscriptionTrend"
            :y-axis="['amount']"
            x-axis="date"
            :categories="{ amount: { name: $t('nav.subscriptions'), color: '#38bdf8' } }"
            :hide-legend="true"
            :radius="6"
            :y-grid-line="true"
            :x-grid-line="false"
            :x-formatter="(tick: number) => subscriptionTrend[tick]?.date || ''"
            :height="224"
          />
        </div>
      </div>
      <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] h-full min-h-[320px] flex flex-col">
        <h3 class="text-sm font-medium text-slate-300 mb-4">{{ $t('analytics.charts.planDistribution') }}</h3>
        <div v-if="planCounts.length === 0" class="flex-grow flex items-center justify-center min-h-[200px]">
          <p class="text-sm text-slate-500">{{ $t('analytics.charts.noActiveSubscriptions') }}</p>
        </div>
        <DonutBreakdown
          v-else
          :values="planCounts"
          :categories="planCategories"
          :total-label="$t('analytics.charts.subscriptionsUnit')"
        />
      </div>
      <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] h-full min-h-[320px] flex flex-col">
        <h3 class="text-sm font-medium text-slate-300 mb-4">{{ $t('analytics.charts.transactionStatus') }}</h3>
        <div v-if="transactionStatusCounts.length === 0" class="flex-grow flex items-center justify-center min-h-[200px]">
          <p class="text-sm text-slate-500">{{ $t('analytics.charts.noTransactionsYet') }}</p>
        </div>
        <DonutBreakdown
          v-else
          :values="transactionStatusCounts"
          :categories="transactionCategories"
          :total-label="$t('analytics.charts.transactionsUnit')"
        />
      </div>
    </div>

    <div class="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-5">
      <h3 class="text-sm font-medium text-slate-300 mb-4">{{ $t('analytics.recentSubscriptions.title') }}</h3>
      <EmptyState
        v-if="recentSubscriptions.length === 0"
        :icon="ReceiptIcon"
        :title="$t('analytics.recentSubscriptions.emptyTitle')"
        :description="$t('analytics.recentSubscriptions.emptyDescription')"
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
          >{{ subscriptionStatusLabels[sub.status as string] ?? sub.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
