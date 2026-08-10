<!-- app/components/layout/TheSidebar.vue -->
<script setup lang="ts">
import {
  LayersIcon, WalletIcon, UsersIcon, SettingsIcon,
  HomeIcon, CreditCardIcon, BarChartIcon, SlidersIcon, SparklesIcon, KeyIcon, PlugIcon,
} from '@lucide/vue'

const route = useRoute()
const { currentApp } = useApps()
const slug = computed(() => route.params.slug as string || currentApp.value?.slug)

const defaultNavItems = [
  { label: 'Apps', to: '/dashboard', icon: LayersIcon },
  { label: 'Earnings', to: '/earnings', icon: WalletIcon },
  { label: 'Team', to: '/team', icon: UsersIcon },
  { label: 'Settings', to: '/settings', icon: SettingsIcon },
]

const activeAppTabs = computed(() => {
  if (!slug.value) return []
  return [
    { label: 'Analytics', to: `/apps/${slug.value}/analytics`, icon: BarChartIcon },
    { label: 'Subscribers', to: `/apps/${slug.value}/subscribers`, icon: UsersIcon },
    { label: 'Subscriptions', to: `/apps/${slug.value}/subscriptions`, icon: CreditCardIcon },
    { label: 'Plans & access', to: `/apps/${slug.value}/plans`, icon: SlidersIcon },
    { label: 'Features', to: `/apps/${slug.value}/features`, icon: SparklesIcon },
    { label: 'API Keys', to: `/apps/${slug.value}/api-keys`, icon: KeyIcon },
    { label: 'Webhooks', to: `/apps/${slug.value}/webhooks`, icon: PlugIcon },
    { label: 'Settings', to: `/apps/${slug.value}/settings`, icon: SettingsIcon },
  ]
})
</script>

<template>
  <aside class="w-75 shrink-0 bg-[var(--color-surface)] overflow-y-auto">
    <nav class="p-4">
      <div class="mb-6">
        <h3 class="px-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          General
        </h3>
        <ul class="space-y-1">
          <li v-for="item in defaultNavItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 px-3.5 py-3 rounded-md text-sm cursor-pointer transition-colors duration-200"
              active-class="bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
              :class="!$route.path.startsWith(item.to) && 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--color-hover)]'"
            >
              <component :is="item.icon" class="w-[18px] h-[18px]" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div v-if="activeAppTabs.length > 0">
        <h3 class="px-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Active App
        </h3>
        <ul class="space-y-1">
          <li v-for="item in activeAppTabs" :key="item.to">
            <NuxtLink
              :id="`tour-sidebar-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`"
              :to="item.to"
              class="flex items-center gap-3 px-3.5 py-3 rounded-md text-sm cursor-pointer transition-colors duration-200"
              active-class="bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
              :class="!$route.path.startsWith(item.to) && 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--color-hover)]'"
            >
              <component :is="item.icon" class="w-[18px] h-[18px]" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>
