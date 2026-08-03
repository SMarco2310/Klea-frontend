<!-- app/components/landing/HowItWorks.vue -->
<script setup lang="ts">
const steps = [
  { n: '1', title: 'Create an app', desc: 'Register your app from the workspace dashboard.' },
  { n: '2', title: 'Generate an API key', desc: 'Start in Test mode with a sandbox key.' },
  { n: '3', title: 'Define a plan', desc: 'Set price, duration, and gated features.' },
  { n: '4', title: 'Go live', desc: 'Flip to Live mode when you are ready for real payments.' },
]
</script>

<template>
  <section class="max-w-5xl mx-auto px-6 py-20">
    <h2 class="font-heading text-3xl font-semibold text-center mb-12">How it works</h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="step in steps" :key="step.n" class="text-center">
        <div class="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-heading font-semibold flex items-center justify-center mx-auto mb-4">
          {{ step.n }}
        </div>
        <h3 class="font-heading font-medium mb-1">{{ step.title }}</h3>
        <p class="text-sm text-slate-400">{{ step.desc }}</p>
      </div>
    </div>
  </section>
</template>
