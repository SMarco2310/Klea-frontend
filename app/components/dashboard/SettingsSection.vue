<!-- app/components/dashboard/SettingsSection.vue -->
<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  title: string
  description?: string
}>()
</script>

<template>
  <section class="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] p-6">
    <div class="flex items-center gap-2 mb-1">
      <component :is="icon" class="w-4 h-4 text-slate-400" />
      <h2 class="font-heading font-semibold">{{ title }}</h2>
    </div>
    <p v-if="description" class="text-sm text-slate-400 mb-5">{{ description }}</p>
    <div class="space-y-4">
      <slot />
    </div>
    <div v-if="$slots.footer" class="mt-5 pt-5 border-t border-[var(--color-border-dark)]">
      <slot name="footer" />
    </div>
  </section>
</template>
