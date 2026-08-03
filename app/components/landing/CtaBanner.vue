<!-- app/components/landing/CtaBanner.vue -->
<script setup lang="ts">
import { Button } from '~/components/ui/button'
</script>

<template>
  <section class="max-w-4xl mx-auto px-6 py-20 text-center">
    <h2 class="font-heading text-3xl font-semibold mb-4">Start shipping licenses today</h2>
    <p class="text-slate-400 mb-8">No credit card required to get started in Test mode.</p>
    <Button size="lg" as-child class="cursor-pointer">
      <NuxtLink to="/signup">Get started free</NuxtLink>
    </Button>
  </section>
</template>
