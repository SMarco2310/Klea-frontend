<!-- app/pages/apps/[slug]/webhooks.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { WebhookIcon } from '@lucide/vue'
import TheSubTabs from '~/components/layout/TheSubTabs.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ? String(currentApp.value.id) : '')
const { deliveries, endpointUrl } = useWebhooks(appId.value)
</script>

<template>
  <div>
    <TheSubTabs />
    <div class="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] mb-6 flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
        <WebhookIcon class="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <div class="font-medium text-sm">Webhook endpoint</div>
        <div class="text-xs text-slate-400">
          {{ endpointUrl ?? 'Not configured — set it in the Overview tab' }}
        </div>
      </div>
    </div>

    <EmptyState
      v-if="deliveries.length === 0"
      :icon="WebhookIcon"
      title="No webhook deliveries yet"
      description="Webhook logs appear here when we deliver subscription events to your endpoint."
    />
  </div>
</template>
