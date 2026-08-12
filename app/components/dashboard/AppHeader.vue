<!-- app/components/dashboard/AppHeader.vue -->
<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()

const { currentApp } = useApps()
const { mode } = useEnvMode()
</script>

<template>
  <div class="mb-6">
    <!-- Redundant app header removed based on user feedback -->

    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="font-heading text-xl font-semibold">{{ title }}</h1>
        <div class="text-sm text-[var(--muted-foreground)] mt-0.5">
          <slot name="subtitle">{{ subtitle }}</slot>
        </div>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
