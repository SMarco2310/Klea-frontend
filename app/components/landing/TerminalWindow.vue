<!-- app/components/landing/TerminalWindow.vue -->
<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <div class="relative rounded-xl overflow-hidden surface-card">
    <div class="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--color-border-dark)] bg-black/10">
      <span class="w-2.5 h-2.5 rounded-full bg-red-400/40" />
      <span class="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
      <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]/40" />
      <span class="ml-2 text-xs text-muted-foreground font-mono">{{ title }}</span>
    </div>
    <div class="p-5 font-mono text-sm leading-relaxed">
      <slot />
    </div>
  </div>
</template>
