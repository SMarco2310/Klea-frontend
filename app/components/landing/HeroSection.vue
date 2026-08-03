<!-- app/components/landing/HeroSection.vue -->
<script setup lang="ts">
import { Button } from '~/components/ui/button'
</script>

<template>
  <section class="max-w-4xl mx-auto text-center px-6 py-24">
    <h1 class="font-heading text-4xl md:text-5xl font-bold leading-tight">
      Issue and validate software licenses through a simple API
    </h1>
    <p class="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
      Create an app, generate a key, define a plan — your subscribers get licensed
      automatically when they pay.
    </p>
    <div class="flex items-center justify-center gap-4 mt-8">
      <Button size="lg" as-child class="cursor-pointer">
        <NuxtLink to="/signup">Get started free</NuxtLink>
      </Button>
      <Button size="lg" variant="secondary" as-child class="cursor-pointer">
        <NuxtLink to="/docs">View docs</NuxtLink>
      </Button>
    </div>
  </section>
</template>
