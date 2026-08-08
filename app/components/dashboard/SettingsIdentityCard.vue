<!-- app/components/dashboard/SettingsIdentityCard.vue -->
<script setup lang="ts">
defineProps<{
  initial: string
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-6 lg:sticky lg:top-8">
    <div class="w-12 h-12 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center text-lg font-heading font-semibold text-[var(--color-accent)] mb-4">
      {{ initial }}
    </div>
    <h2 class="font-heading font-semibold text-lg leading-tight break-words">{{ title }}</h2>
    <p v-if="subtitle" class="text-sm text-slate-400 mt-0.5 break-all">{{ subtitle }}</p>
    <div v-if="$slots.default" class="mt-5 pt-5 border-t border-[var(--color-border-dark)] space-y-3">
      <slot />
    </div>
  </div>
</template>
