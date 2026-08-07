<!-- app/pages/team.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { user } = useAppAuth()
</script>

<template>
  <div>
    <h1 class="font-heading text-2xl font-semibold mb-6">Team</h1>
    <div class="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] divide-y divide-[var(--color-border-dark)]">
      <div class="flex items-center gap-3 px-5 py-4">
        <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold">
          {{ (user?.name || 'A').charAt(0).toUpperCase() }}
        </span>
        <div>
          <div class="font-medium">{{ user?.name ?? 'You' }}</div>
          <div class="text-xs text-slate-400">{{ user?.email }}</div>
        </div>
        <span class="ml-auto text-xs text-slate-400">Owner</span>
      </div>
    </div>
  </div>
</template>
