<!-- app/components/landing/CodePreview.vue -->
<template>
  <section class="max-w-3xl mx-auto px-6 py-24">
    <div class="text-center mb-10">
      <span class="text-xs font-mono text-[var(--color-accent)] uppercase tracking-widest">One request</span>
      <h2 class="font-heading text-2xl md:text-3xl font-semibold mt-3 tracking-tight">Authenticate with a bearer token</h2>
    </div>
    <pre class="bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] rounded-xl p-6 text-sm font-mono overflow-x-auto leading-relaxed"><code><span class="text-slate-500">curl</span> https://api.klea.dev/v1/plans \
  -H <span class="text-slate-400">"Authorization: Bearer</span> <span class="text-[var(--color-key)]">lk_test_9f2a…c73e</span><span class="text-slate-400">"</span></code></pre>
  </section>
</template>
