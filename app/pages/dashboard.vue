<!-- app/pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { LayersIcon, UsersIcon, KeyIcon, PlusIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import StatCard from '~/components/dashboard/StatCard.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import CreateAppModal from '~/components/layout/CreateAppModal.vue'
import VerifyEmailBanner from '~/components/dashboard/VerifyEmailBanner.vue'

const { user } = useAppAuth()
const { workspace } = useWorkspace()
const { apps } = useApps()
const { mode } = useEnvMode()
const { apiKeys: allApiKeysRaw } = useSeedData()
const totalApiKeys = computed(
  () => allApiKeysRaw.value.filter((k) => k.env === mode.value).length
)

const createOpen = ref(false)
</script>

<template>
  <div>
    <VerifyEmailBanner />
    <div class="flex items-center gap-4 mb-8">
      <div class="w-12 h-12 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
        <LayersIcon class="w-6 h-6 text-[var(--color-accent)]" />
      </div>
      <div>
        <h1 class="font-heading text-2xl font-semibold">Welcome back, {{ user?.name ?? 'there' }}</h1>
        <p class="text-slate-400 text-sm">
          You're working in <span class="font-medium text-slate-200">{{ workspace.name }}</span>
          · {{ mode === 'live' ? 'Live' : 'Test' }} mode
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      <StatCard label="Applications" :value="apps.length" :icon="LayersIcon" sublabel="Total registered apps" />
      <StatCard label="Subscribers" :value="0" :icon="UsersIcon" sublabel="In live environment" />
      <StatCard label="API Keys" :value="totalApiKeys" :icon="KeyIcon" sublabel="Issued keys" />
    </div>

    <div class="flex items-center justify-between mb-4">
      <h2 class="font-heading text-lg font-semibold">Your apps</h2>
      <Button class="cursor-pointer gap-1" @click="createOpen = true">
        <PlusIcon class="w-4 h-4" /> New app
      </Button>
    </div>

    <div v-if="apps.length === 0">
      <EmptyState
        :icon="LayersIcon"
        title="No apps yet"
        description="Create your first app to start issuing licenses."
        cta-label="New app"
        @cta="createOpen = true"
      />
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <NuxtLink
        v-for="app in apps"
        :key="app.id"
        :to="`/apps/${app.slug}/overview`"
        class="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] hover:border-[var(--color-accent)]/50 cursor-pointer transition-colors duration-200"
      >
        <div class="flex items-center justify-between mb-4">
          <span class="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs font-semibold">
            {{ app.name[0] }}
          </span>
          <Badge v-if="app.status === 'active'" class="bg-[var(--color-accent)]/20 text-[var(--color-accent)]">Active</Badge>
        </div>
        <h3 class="font-heading font-semibold">{{ app.name }}</h3>
        <p class="text-sm text-slate-400">{{ app.slug }}</p>
        <div class="border-t border-[var(--color-border-dark)] mt-4 pt-3 text-xs text-slate-500">
          {{ app.webhookUrl ? 'Webhook configured' : 'No webhook' }}
        </div>
      </NuxtLink>
    </div>

    <CreateAppModal v-model:open="createOpen" />
  </div>
</template>
