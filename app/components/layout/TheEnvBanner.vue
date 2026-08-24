<!-- app/components/layout/TheEnvBanner.vue -->
<script setup lang="ts">
import { FlaskConicalIcon, ZapIcon } from '@lucide/vue'
const { mode } = useEnvMode()
</script>

<template>
  <div
    v-if="mode === 'test'"
    class="w-full bg-amber-400/25 border-b border-amber-500/40 text-amber-600 dark:text-amber-300 text-sm px-4 py-2 flex items-center gap-2"
  >
    <FlaskConicalIcon class="w-4 h-4" />
    {{ $t('env.testModeBanner') }}
  </div>
  <div
    v-else
    class="w-full bg-[var(--color-accent)]/10 border-b border-[var(--color-accent)]/30 text-[var(--color-accent)] text-sm px-4 py-2 flex items-center gap-2"
  >
    <ZapIcon class="w-4 h-4" />
    {{ $t('env.liveModeBanner') }}
  </div>
</template>
