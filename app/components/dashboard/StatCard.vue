<!-- app/components/dashboard/StatCard.vue -->
<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string | number | null
  icon: Component
  sublabel?: string
}>()
</script>

<template>
  <div class="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)]">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs uppercase tracking-wide text-slate-400">{{ label }}</span>
      <component :is="icon" class="w-4 h-4 text-slate-500" />
    </div>
    <div class="text-3xl font-heading font-bold">{{ value === null ? '—' : value }}</div>
    <div v-if="sublabel" class="text-xs text-slate-500 mt-1">{{ sublabel }}</div>
  </div>
</template>
