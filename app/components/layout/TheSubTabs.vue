<!-- app/components/layout/TheSubTabs.vue -->
<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const tabs = [
  { label: 'Overview', to: `/apps/${slug}/overview` },
  { label: 'Plans', to: `/apps/${slug}/plans` },
  { label: 'Features', to: `/apps/${slug}/features` },
  { label: 'Subscribers', to: `/apps/${slug}/subscribers` },
  { label: 'Subscriptions', to: `/apps/${slug}/subscriptions` },
  { label: 'Analytics', to: `/apps/${slug}/analytics` },
  { label: 'Webhooks', to: `/apps/${slug}/webhooks` },
]
</script>

<template>
  <div class="flex items-center gap-1 border-b border-[var(--color-border-dark)] mb-6 -mx-1 overflow-x-auto">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="px-4 py-2.5 text-sm rounded-t-md cursor-pointer transition-colors duration-200 border-b-2"
      active-class="border-[var(--color-accent)] text-white"
      :class="!route.path.startsWith(tab.to) && 'border-transparent text-slate-400 hover:text-white'"
    >
      {{ tab.label }}
    </NuxtLink>
  </div>
</template>
