<!-- app/pages/apps/[slug]/subscribers.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { UsersIcon, MailIcon, PhoneIcon, LayersIcon, CalendarIcon } from '@lucide/vue'
import { formatDate } from '~/utils/format'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import DataTable from '~/components/dashboard/DataTable.vue'
import IdentityCell from '~/components/dashboard/IdentityCell.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)
const { subscribers, pending, fetchSubscribers } = useSubscribers(appId)
const { t } = useI18n()

watchEffect(() => {
  if (appId.value) fetchSubscribers()
})

// Computed so labels re-evaluate on locale switch — a plain array literal
// would not.
const columns = computed(() => [
  { key: 'email', label: t('subscribers.columns.email'), icon: MailIcon, searchable: true },
  { key: 'phone_number', label: t('subscribers.columns.phone'), icon: PhoneIcon, searchable: true },
  { key: 'environment', label: t('subscribers.columns.environment'), icon: LayersIcon },
  { key: 'created_at', label: t('subscribers.columns.joined'), icon: CalendarIcon },
])

const subtitle = computed(() =>
  subscribers.value.length === 1
    ? t('subscribers.subtitleOne', { count: subscribers.value.length })
    : t('subscribers.subtitleOther', { count: subscribers.value.length })
)
</script>

<template>
  <div>
    <AppHeader :title="$t('nav.subscribers')" :subtitle="subtitle" />
    <p v-if="pending" class="text-sm text-slate-400 mb-4">{{ $t('subscribers.loading') }}</p>
    <div v-else-if="subscribers.length === 0" class="flex flex-col items-center justify-center">
      <EmptyState
        :icon="UsersIcon"
        :title="$t('subscribers.emptyTitle')"
        :description="$t('subscribers.emptyDescription')"
        class="w-full"
      />
    </div>
    <div v-else class="overflow-x-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-4 min-h-[calc(100vh-16rem)]">
      <DataTable :columns="columns" :rows="subscribers" :search-placeholder="$t('subscribers.searchPlaceholder')">
        <template #cell-email="{ row }">
          <IdentityCell :value="row.email as string" :sub="row.external_id as string" />
        </template>
        <template #cell-environment="{ row }">
          <span
            class="inline-block px-2 py-0.5 rounded text-xs font-medium capitalize"
            :class="row.environment === 'live' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'bg-amber-400/10 text-amber-400'"
          >{{ row.environment }}</span>
        </template>
        <template #cell-created_at="{ row }">{{ formatDate(row.created_at as string) }}</template>
      </DataTable>
    </div>
  </div>
</template>
