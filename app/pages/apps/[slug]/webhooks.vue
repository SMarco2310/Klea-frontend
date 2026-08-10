<!-- app/pages/apps/[slug]/webhooks.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { WebhookIcon, CopyIcon, CheckIcon, EyeIcon, EyeOffIcon, KeySquareIcon } from '@lucide/vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'

const { currentApp } = useApps()
const { deliveries, endpointUrl, webhookSecret, fetchDeliveries } = useWebhooks()

watchEffect(() => {
  fetchDeliveries()
})

const copiedUrl = ref(false)
const copiedSecret = ref(false)
const secretVisible = ref(false)

async function copyUrl() {
  if (!endpointUrl.value) return
  await navigator.clipboard.writeText(endpointUrl.value)
  copiedUrl.value = true
  setTimeout(() => { copiedUrl.value = false }, 2000)
}

async function copySecret() {
  if (!webhookSecret.value) return
  await navigator.clipboard.writeText(webhookSecret.value)
  copiedSecret.value = true
  setTimeout(() => { copiedSecret.value = false }, 2000)
}

const maskedSecret = computed(() =>
  webhookSecret.value ? `${webhookSecret.value.slice(0, 6)}${'•'.repeat(24)}` : null
)
</script>

<template>
  <div>
    <AppHeader title="Webhooks" subtitle="Manage where subscription events get delivered" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)]">
        <div class="flex items-center gap-3 mb-3">
          <span class="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
            <WebhookIcon class="w-4 h-4 text-slate-400" />
          </span>
          <div class="min-w-0">
            <div class="font-medium text-sm">Endpoint URL</div>
            <div class="text-xs text-slate-500">Where we POST subscription events</div>
          </div>
        </div>
        <div
          v-if="endpointUrl"
          class="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)]"
        >
          <code class="text-xs font-mono flex-1 truncate">{{ endpointUrl }}</code>
          <button class="text-slate-400 hover:text-white cursor-pointer shrink-0" aria-label="Copy endpoint URL" @click="copyUrl">
            <component :is="copiedUrl ? CheckIcon : CopyIcon" class="w-3.5 h-3.5" />
          </button>
        </div>
        <p v-else class="text-xs text-slate-500">
          Not configured —
          <NuxtLink :to="`/apps/${currentApp?.slug}/settings`" class="text-[var(--color-accent)] hover:underline">set it in Settings</NuxtLink>
        </p>
      </div>

      <div class="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)]">
        <div class="flex items-center gap-3 mb-3">
          <span class="w-9 h-9 rounded-lg bg-[var(--color-key)]/10 flex items-center justify-center shrink-0">
            <KeySquareIcon class="w-4 h-4 text-[var(--color-key)]" />
          </span>
          <div class="min-w-0">
            <div class="font-medium text-sm">Signing secret</div>
            <div class="text-xs text-slate-500">Verify a delivery really came from Klea</div>
          </div>
        </div>
        <div
          v-if="webhookSecret"
          class="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)]"
        >
          <code class="text-xs font-mono flex-1 truncate">{{ secretVisible ? webhookSecret : maskedSecret }}</code>
          <button
            class="text-slate-400 hover:text-white cursor-pointer shrink-0"
            :aria-label="secretVisible ? 'Hide secret' : 'Show secret'"
            @click="secretVisible = !secretVisible"
          >
            <component :is="secretVisible ? EyeOffIcon : EyeIcon" class="w-3.5 h-3.5" />
          </button>
          <button class="text-slate-400 hover:text-white cursor-pointer shrink-0" aria-label="Copy signing secret" @click="copySecret">
            <component :is="copiedSecret ? CheckIcon : CopyIcon" class="w-3.5 h-3.5" />
          </button>
        </div>
        <p v-else class="text-xs text-slate-500">Generated automatically once you set an endpoint URL.</p>
      </div>
    </div>

    <div class="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-0">
      <h3 class="text-sm font-medium text-slate-300 mb-4 p-5 pb-0">Recent deliveries</h3>
      <div v-if="deliveries.length === 0" class="p-5">
        <EmptyState
          :icon="WebhookIcon"
          title="No deliveries yet"
          description="Delivery logs will appear here once we send your endpoint its first subscription event."
        />
      </div>
      <table v-else class="w-full text-left text-sm whitespace-nowrap mt-4">
        <thead class="border-y border-[var(--color-border-dark)] bg-[var(--color-surface-muted)]">
          <tr>
            <th class="px-5 py-3 font-medium text-slate-300">Date</th>
            <th class="px-5 py-3 font-medium text-slate-300">Status</th>
            <th class="px-5 py-3 font-medium text-slate-300">Event</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--color-border-dark)]">
          <tr v-for="delivery in deliveries" :key="delivery.id" class="hover:bg-white/5 transition-colors">
            <td class="px-5 py-3 text-slate-400">
              {{ new Date(delivery.created_at).toLocaleString() }}
            </td>
            <td class="px-5 py-3">
              <span 
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-500/10 text-green-400 border border-green-500/20': delivery.status_code && delivery.status_code.startsWith('2'),
                  'bg-red-500/10 text-red-400 border border-red-500/20': !delivery.status_code || !delivery.status_code.startsWith('2')
                }"
              >
                {{ delivery.status_code || 'Failed' }}
              </span>
            </td>
            <td class="px-5 py-3 font-mono text-xs text-slate-300">
              {{ delivery.payload ? 'subscription.updated' : 'unknown' }} <!-- We could parse JSON here if needed -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
