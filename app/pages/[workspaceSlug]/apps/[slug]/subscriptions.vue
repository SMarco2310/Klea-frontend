<!-- app/pages/apps/[slug]/subscriptions.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { ReceiptIcon, MailIcon, LayersIcon, ActivityIcon, BanknoteIcon, CalendarIcon } from '@lucide/vue'
import { formatCurrency, formatDate } from '~/utils/format'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import DataTable from '~/components/dashboard/DataTable.vue'
import IdentityCell from '~/components/dashboard/IdentityCell.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)
const { subscriptions, pending, fetchSubscriptions } = useSubscriptions(appId.value)
const { t } = useI18n()

watchEffect(() => {
  if (appId.value) fetchSubscriptions()
})

// Computed so labels re-evaluate on locale switch — a plain array literal
// would not.
const columns = computed(() => [
  { key: 'email', label: t('subscriptions.columns.subscriber'), icon: MailIcon, searchable: 'subscriber.email' },
  { key: 'plan', label: t('subscriptions.columns.plan'), icon: LayersIcon, searchable: 'plan.name' },
  { key: 'status', label: t('subscriptions.columns.status'), icon: ActivityIcon },
  { key: 'amount', label: t('subscriptions.columns.amount'), icon: BanknoteIcon },
  { key: 'starts_at', label: t('subscriptions.columns.started'), icon: CalendarIcon },
])

// The status VALUE (active/expired/cancelled) is the raw API enum and is
// never translated — only the displayed label is.
const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  expired: 'bg-[var(--color-surface-muted)] text-[var(--muted-foreground)] border border-[var(--color-border-dark)]',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
}

const statusLabels = computed<Record<string, string>>(() => ({
  active: t('subscriptions.status.active'),
  expired: t('subscriptions.status.expired'),
  cancelled: t('subscriptions.status.cancelled'),
}))

const subtitle = computed(() =>
  subscriptions.value.length === 1
    ? t('subscriptions.subtitleOne', { count: subscriptions.value.length })
    : t('subscriptions.subtitleOther', { count: subscriptions.value.length })
)
</script>

<template>
  <div>
    <AppHeader :title="$t('nav.subscriptions')" :subtitle="subtitle" />
    <p v-if="pending" class="text-sm text-[var(--muted-foreground)] mb-4">{{ $t('subscriptions.loading') }}</p>
    <div v-else-if="subscriptions.length === 0" class="flex flex-col items-center justify-center">
      <EmptyState
        :icon="ReceiptIcon"
        :title="$t('subscriptions.emptyTitle')"
        :description="$t('subscriptions.emptyDescription')"
        class="w-full"
      />
    </div>
    <div v-else class="overflow-x-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-4 min-h-[calc(100vh-16rem)]">
      <DataTable :columns="columns" :rows="subscriptions" :search-placeholder="$t('subscriptions.searchPlaceholder')">
        <template #cell-email="{ row }">
          <IdentityCell :value="row.subscriber?.email" :sub="row.subscriber?.external_id" />
        </template>
        <template #cell-plan="{ row }">
          <span class="text-[var(--muted-foreground)] font-mono text-xs px-2 py-0.5 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)]">
            {{ row.plan?.name ?? '—' }}
          </span>
        </template>
        <template #cell-status="{ row }">
          <span
            class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
            :class="STATUS_STYLES[row.status as string] ?? STATUS_STYLES.expired"
          >
            {{ statusLabels[row.status as string] ?? row.status }}
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
