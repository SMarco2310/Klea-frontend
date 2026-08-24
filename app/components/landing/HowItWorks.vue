<!-- app/components/landing/HowItWorks.vue -->
<script setup lang="ts">
import ScrollReveal from '~/components/landing/ScrollReveal.vue'

const { t } = useI18n()

const steps = computed(() => [
  { n: '01', title: t('landing.howItWorks.step1.title'), desc: t('landing.howItWorks.step1.desc') },
  { n: '02', title: t('landing.howItWorks.step2.title'), desc: t('landing.howItWorks.step2.desc') },
  { n: '03', title: t('landing.howItWorks.step3.title'), desc: t('landing.howItWorks.step3.desc') },
  { n: '04', title: t('landing.howItWorks.step4.title'), desc: t('landing.howItWorks.step4.desc') },
])
</script>

<template>
  <section class="max-w-5xl mx-auto px-6 py-24">
    <ScrollReveal direction="up" :duration="700">
      <div class="text-center mb-14">
        <span class="text-xs font-mono text-[var(--color-accent)] uppercase tracking-widest">{{ $t('landing.howItWorks.eyebrow') }}</span>
        <h2 class="font-heading text-3xl md:text-4xl font-semibold mt-3 tracking-[-0.015em] leading-[1.15]">{{ $t('landing.howItWorks.title') }}</h2>
      </div>
    </ScrollReveal>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
      <div
        class="hidden md:block absolute top-5 left-[12.5%] right-[12.5%] h-px opacity-20"
        style="background-image: linear-gradient(90deg, transparent, var(--color-foreground) 12%, var(--color-foreground) 88%, transparent)"
        aria-hidden="true"
      />
      <ScrollReveal
        v-for="(step, idx) in steps"
        :key="step.n"
        direction="up"
        :delay="idx * 120"
        :duration="600"
      >
        <div class="text-center relative">
          <div class="w-10 h-10 rounded-full bg-[var(--color-bg)] border border-[var(--color-accent)]/40 text-[var(--color-accent)] font-mono text-sm font-medium flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_-6px_var(--color-accent)]">
            {{ step.n }}
          </div>
          <h3 class="font-heading font-medium mb-1.5">{{ step.title }}</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">{{ step.desc }}</p>
        </div>
      </ScrollReveal>
    </div>
  </section>
</template>
