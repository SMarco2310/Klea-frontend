<!-- app/pages/apps/[slug]/subscribers.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { UsersIcon } from '@lucide/vue'
import { formatDate } from '~/utils/format'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import DataTable from '~/components/dashboard/DataTable.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)
const { subscribers, pending, fetchSubscribers } = useSubscribers(appId.value)

watchEffect(() => {
  if (appId.value) fetchSubscribers()
})

const columns = [
  { key: 'email', label: 'Email' },
  { key: 'phone_number', label: 'Phone' },
  { key: 'environment', label: 'Environment' },
  { key: 'created_at', label: 'Joined' },
]
</script>

<template>
  <div>
    <AppHeader title="Subscribers" :subtitle="`${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}`" />
    <p v-if="pending" class="text-sm text-slate-400 mb-4">Loading subscribers...</p>
    <div v-else-if="subscribers.length === 0" class="flex flex-col items-center justify-center">
      <EmptyState
        :icon="UsersIcon"
        title="No subscribers yet"
        description="When end users subscribe through your app, they'll appear here with their contact details."
        class="w-full"
      />
    </div>
    <div v-else class="overflow-x-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-4 min-h-[calc(100vh-16rem)]">
      <DataTable :columns="columns" :rows="subscribers">
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
