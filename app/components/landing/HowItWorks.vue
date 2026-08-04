<!-- app/components/landing/HowItWorks.vue -->
<script setup lang="ts">
const steps = [
  { n: '01', title: 'Create an app', desc: 'Register your app from the workspace dashboard.' },
  { n: '02', title: 'Generate an API key', desc: 'Start in Test mode with a sandbox key.' },
  { n: '03', title: 'Define a plan', desc: 'Set price, duration, and gated features.' },
  { n: '04', title: 'Go live', desc: 'Flip to Live mode when you are ready for real payments.' },
]
</script>

<template>
  <section class="max-w-5xl mx-auto px-6 py-24">
    <div class="text-center mb-14">
      <span class="text-xs font-mono text-[var(--color-accent)] uppercase tracking-widest">Four steps</span>
      <h2 class="font-heading text-3xl md:text-4xl font-semibold mt-3 tracking-tight">From zero to licensed</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
      <div class="hidden md:block absolute top-5 left-[12.5%] right-[12.5%] h-px bg-[var(--color-border-dark)]" aria-hidden="true" />
      <div v-for="step in steps" :key="step.n" class="text-center relative">
        <div class="w-10 h-10 rounded-full bg-[var(--color-bg)] border border-[var(--color-accent)]/40 text-[var(--color-accent)] font-mono text-sm font-medium flex items-center justify-center mx-auto mb-5">
          {{ step.n }}
        </div>
        <h3 class="font-heading font-medium mb-1.5">{{ step.title }}</h3>
        <p class="text-sm text-slate-400 leading-relaxed">{{ step.desc }}</p>
      </div>
    </div>
  </section>
</template>
