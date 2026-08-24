<!-- app/components/landing/CtaBanner.vue -->
<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { ArrowRightIcon } from '@lucide/vue'
</script>

<template>
  <section class="max-w-4xl mx-auto px-6 py-24 text-center">
    <div class="surface-card rounded-2xl px-8 py-16 relative overflow-hidden">
      <div class="absolute -inset-x-20 -top-32 h-64 bg-[var(--color-accent)]/[0.08] blur-3xl rounded-full" aria-hidden="true" />
      <div class="relative">
        <h2 class="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">
          {{ $t('landing.cta.title') }}
        </h2>
        <p class="text-muted-foreground mb-9 text-lg">{{ $t('landing.cta.subtitle') }}</p>
        <Button
          size="lg"
          as-child
          class="cursor-pointer h-12 px-8 text-base shadow-[0_0_0_0_var(--color-accent)] hover:shadow-[0_0_32px_-4px_var(--color-accent)] transition-shadow duration-300"
        >
          <NuxtLink to="/signup" class="flex items-center gap-2">
            {{ $t('landing.cta.button') }} <ArrowRightIcon class="w-4 h-4" />
          </NuxtLink>
        </Button>
      </div>
    </div>
  </section>
</template>
