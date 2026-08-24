<!-- app/components/layout/TheSidebar.vue -->
<script setup lang="ts">
import {
  LayersIcon, WalletIcon, UsersIcon, SettingsIcon,
  HomeIcon, CreditCardIcon, BarChartIcon, SlidersIcon, SparklesIcon, KeyIcon, PlugIcon,
} from '@lucide/vue'

const route = useRoute()
const { currentApp } = useApps()
const { workspace } = useWorkspace()
const { t } = useI18n()
const slug = computed(() => route.params.slug as string || currentApp.value?.slug)

const defaultNavItems = computed(() => [
  { label: t('nav.apps'), to: `/${workspace.value.slug}/dashboard`, icon: LayersIcon },
  { label: t('nav.earnings'), to: `/${workspace.value.slug}/earnings`, icon: WalletIcon },
  { label: t('nav.team'), to: `/${workspace.value.slug}/team`, icon: UsersIcon },
  { label: t('nav.settings'), to: `/${workspace.value.slug}/settings`, icon: SettingsIcon },
])

// tourId is a stable, locale-independent slug used only to build the
// #tour-sidebar-* element id that useTour.ts targets. It must NOT be derived
// from the translated label — the tour selectors are hardcoded in English
// (e.g. '#tour-sidebar-plans-access') and would stop matching after a
// locale switch if the id were derived from the (translated) label text.
const activeAppTabs = computed(() => {
  if (!slug.value) return []
  return [
    { label: t('nav.analytics'), tourId: 'analytics', to: `/${workspace.value.slug}/apps/${slug.value}/analytics`, icon: BarChartIcon },
    { label: t('nav.subscribers'), tourId: 'subscribers', to: `/${workspace.value.slug}/apps/${slug.value}/subscribers`, icon: UsersIcon },
    { label: t('nav.subscriptions'), tourId: 'subscriptions', to: `/${workspace.value.slug}/apps/${slug.value}/subscriptions`, icon: CreditCardIcon },
    { label: t('nav.plansAndAccess'), tourId: 'plans-access', to: `/${workspace.value.slug}/apps/${slug.value}/plans`, icon: SlidersIcon },
    { label: t('nav.features'), tourId: 'features', to: `/${workspace.value.slug}/apps/${slug.value}/features`, icon: SparklesIcon },
    { label: t('nav.apiKeys'), tourId: 'api-keys', to: `/${workspace.value.slug}/apps/${slug.value}/api-keys`, icon: KeyIcon },
    { label: t('nav.webhooks'), tourId: 'webhooks', to: `/${workspace.value.slug}/apps/${slug.value}/webhooks`, icon: PlugIcon },
    { label: t('nav.settings'), tourId: 'settings', to: `/${workspace.value.slug}/apps/${slug.value}/settings`, icon: SettingsIcon },
  ]
})
</script>

<template>
  <aside class="w-75 shrink-0 bg-[var(--color-surface)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
    <nav class="p-4">
      <div class="mb-6">
        <h3 class="px-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          {{ $t('nav.generalSection') }}
        </h3>
        <ul class="space-y-1">
          <li v-for="item in defaultNavItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 px-3.5 py-3 rounded-md text-sm cursor-pointer transition-colors duration-200"
              :class="[
                $route.path.startsWith(item.to)
                  ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--color-hover)]'
              ]"
            >
              <component :is="item.icon" class="w-[18px] h-[18px]" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div v-if="activeAppTabs.length > 0">
        <h3 class="px-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          {{ $t('nav.activeAppSection') }}
        </h3>
        <ul class="space-y-1">
          <li v-for="item in activeAppTabs" :key="item.to">
            <NuxtLink
              :id="`tour-sidebar-${item.tourId}`"
              :to="item.to"
              class="flex items-center gap-3 px-3.5 py-3 rounded-md text-sm cursor-pointer transition-colors duration-200"
              :class="[
                $route.path.startsWith(item.to)
                  ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--color-hover)]'
              ]"
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
