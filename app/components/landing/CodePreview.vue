<!-- app/components/landing/CodePreview.vue -->
<script setup lang="ts">
import TerminalWindow from '~/components/landing/TerminalWindow.vue'
</script>

<template>
  <section class="max-w-3xl mx-auto px-6 py-24">
    <div class="text-center mb-10">
      <span class="text-xs font-mono text-[var(--color-accent)] uppercase tracking-widest">One request</span>
      <h2 class="font-heading text-2xl md:text-3xl font-semibold mt-3 tracking-tight">Authenticate with a bearer token</h2>
    </div>
    <div class="relative">
      <div class="absolute -inset-8 bg-[var(--color-accent)]/[0.06] blur-3xl rounded-full" aria-hidden="true" />
      <TerminalWindow title="auth.sh" class="relative shadow-2xl">
        <code><span class="text-slate-500">curl</span> https://api.klea.dev/v1/plans \
  -H <span class="text-slate-400">"Authorization: Bearer</span> <span class="text-[var(--color-key)]">lk_test_9f2a…c73e</span><span class="text-slate-400">"</span></code>
      </TerminalWindow>
    </div>
  </section>
</template>
