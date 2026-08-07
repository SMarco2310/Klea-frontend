<!-- app/pages/apps/[slug]/subscribers.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { UsersIcon } from '@lucide/vue'
import { formatDate } from '~/utils/format'
import TheSubTabs from '~/components/layout/TheSubTabs.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import DataTable from '~/components/dashboard/DataTable.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ? String(currentApp.value.id) : '')
const { subscribers } = useSubscribers(appId.value)

const columns = [
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'joinedAt', label: 'Joined' },
]
</script>

<template>
  <div>
    <TheSubTabs />
    <EmptyState
      v-if="subscribers.length === 0"
      :icon="UsersIcon"
      title="No subscribers yet"
      description="When end users pay through your app, they'll appear here with their subscription details."
    />
    <div v-else class="overflow-x-auto">
      <DataTable :columns="columns" :rows="subscribers">
        <template #cell-joinedAt="{ row }">{{ formatDate(row.joinedAt as string) }}</template>
      </DataTable>
    </div>
  </div>
</template>
