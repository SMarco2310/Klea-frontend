<!-- app/pages/apps/[slug]/webhooks.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { WebhookIcon, CopyIcon, CheckIcon, EyeIcon, EyeOffIcon, KeySquareIcon } from '@lucide/vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'

const { currentApp } = useApps()
const { deliveries, endpointUrl, webhookSecret } = useWebhooks()

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

    <div class="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-5">
      <h3 class="text-sm font-medium text-slate-300 mb-4">Recent deliveries</h3>
      <EmptyState
        v-if="deliveries.length === 0"
        :icon="WebhookIcon"
        title="No deliveries yet"
        description="Delivery logs will appear here once we send your endpoint its first subscription event."
      />
    </div>
  </div>
</template>
