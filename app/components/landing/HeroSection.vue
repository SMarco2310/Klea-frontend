<!-- app/components/landing/HeroSection.vue -->
<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { ArrowRightIcon, CheckIcon } from '@lucide/vue'
import ScrollReveal from '~/components/landing/ScrollReveal.vue'

const validated = ref(false)

onMounted(() => {
  const t = setTimeout(() => { validated.value = true }, 900)
  onUnmounted(() => clearTimeout(t))
})
</script>

<template>
  <section class="max-w-6xl mx-auto px-6 pt-32 pb-24 md:pt-40 md:pb-32">
    <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
      <ScrollReveal direction="up" :delay="100" :duration="800">
        <div>
          <span class="inline-block text-xs font-mono text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded-full px-3 py-1 mb-6">
            Licensing infrastructure for SaaS
          </span>
          <h1 class="font-heading text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
            Issue and validate<br />
            software licenses<br />
            <span class="text-[var(--color-accent)]">in one API call.</span>
          </h1>
          <p class="text-slate-400 text-lg mt-6 max-w-lg leading-relaxed">
            Create an app, generate a key, define a plan — your subscribers get
            licensed automatically the moment they pay.
          </p>
          <div class="flex flex-wrap items-center gap-4 mt-10">
            <Button
              size="lg"
              as-child
              class="cursor-pointer h-12 px-7 text-base shadow-[0_0_0_0_var(--color-accent)] hover:shadow-[0_0_32px_-4px_var(--color-accent)] transition-shadow duration-300"
            >
              <NuxtLink to="/signup" class="flex items-center gap-2">
                Get started free <ArrowRightIcon class="w-4 h-4" />
              </NuxtLink>
            </Button>
            <Button size="lg" variant="secondary" as-child class="cursor-pointer h-12 px-7 text-base">
              <NuxtLink to="/docs">View docs</NuxtLink>
            </Button>
          </div>
          <p class="text-xs text-slate-500 mt-4 font-mono">No credit card · Test mode included</p>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="left" :delay="300" :duration="900">
        <div class="relative">
          <div class="absolute -inset-6 bg-[var(--color-accent)]/[0.06] blur-3xl rounded-full" aria-hidden="true" />
          <div class="relative rounded-xl border border-[var(--color-border-dark)] bg-[var(--color-surface-muted)] overflow-hidden shadow-2xl">
            <div class="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--color-border-dark)] bg-[var(--color-surface)]/50">
              <span class="w-2.5 h-2.5 rounded-full bg-red-400/40" />
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
              <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]/40" />
              <span class="ml-2 text-xs text-slate-500 font-mono">validate-license.sh</span>
            </div>
            <div class="p-5 font-mono text-sm leading-relaxed">
              <div class="text-slate-500">POST /v1/licenses/validate</div>
              <div class="mt-3 flex flex-wrap gap-x-1">
                <span class="text-slate-500">key:</span>
                <span class="text-[var(--color-key)]">lk_live_9f2a…c73e</span>
              </div>
              <div class="mt-4 flex items-center gap-2 h-5">
                <template v-if="!validated">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                  <span class="text-slate-400">checking key…</span>
                </template>
                <template v-else>
                  <CheckIcon class="w-4 h-4 text-[var(--color-accent)]" />
                  <span class="text-[var(--color-accent)]">valid</span>
                  <span class="text-slate-500">· plan: pro · expires in 27d</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
</template>
