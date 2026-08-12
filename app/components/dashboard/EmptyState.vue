<!-- app/components/dashboard/EmptyState.vue -->
<script setup lang="ts">
import type { Component } from 'vue'
import { Button } from '~/components/ui/button'

defineProps<{
  icon: Component
  title: string
  description: string
  ctaLabel?: string
}>()
const emit = defineEmits<{ cta: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)]">
    <div class="w-12 h-12 rounded-lg bg-[var(--color-foreground)]/5 flex items-center justify-center mb-4">
      <component :is="icon" class="w-6 h-6 text-[var(--muted-foreground)]" />
    </div>
    <h3 class="font-heading font-semibold mb-1">{{ title }}</h3>
    <p class="text-sm text-[var(--muted-foreground)] max-w-sm">{{ description }}</p>
    <Button v-if="ctaLabel" class="mt-4 cursor-pointer" @click="emit('cta')">{{ ctaLabel }}</Button>
  </div>
</template>
