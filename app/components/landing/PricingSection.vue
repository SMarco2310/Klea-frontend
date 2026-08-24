<!-- app/components/landing/PricingSection.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '~/components/ui/button'
import { CheckIcon } from '@lucide/vue'
import ScrollReveal from '~/components/landing/ScrollReveal.vue'

const { t } = useI18n()

const isYearly = ref(false)

const tiers = computed(() => [
  {
    key: 'free',
    name: t('landing.pricing.free.name'),
    price: t('landing.pricing.free.price'),
    features: [
      t('landing.pricing.free.feature1'),
      t('landing.pricing.free.feature2'),
      t('landing.pricing.free.feature3'),
      t('landing.pricing.free.feature4'),
      t('landing.pricing.free.feature5'),
    ],
    highlighted: false,
  },
  {
    key: 'standard',
    name: t('landing.pricing.standard.name'),
    price: t('landing.pricing.standard.price'),
    features: [
      t('landing.pricing.standard.feature1'),
      t('landing.pricing.standard.feature2'),
      t('landing.pricing.standard.feature3'),
      t('landing.pricing.standard.feature4'),
      t('landing.pricing.standard.feature5'),
    ],
    highlighted: true,
  },
  {
    key: 'pro',
    name: t('landing.pricing.pro.name'),
    price: t('landing.pricing.pro.price'),
    features: [
      t('landing.pricing.pro.feature1'),
      t('landing.pricing.pro.feature2'),
      t('landing.pricing.pro.feature3'),
      t('landing.pricing.pro.feature4'),
      t('landing.pricing.pro.feature5'),
    ],
    highlighted: false,
  },
])
</script>

<template>
  <section id="pricing" class="relative max-w-6xl mx-auto px-6 py-32 overflow-hidden flex flex-col items-center">
    <!-- Huge background text -->
    <div class="absolute inset-0 flex items-start pt-16 justify-center pointer-events-none select-none -z-10">
      <h2 class="text-[12rem] md:text-[18rem] font-bold text-foreground/[0.03] tracking-tighter mix-blend-overlay leading-none">{{ $t('landing.pricing.title') }}</h2>
    </div>

    <!-- Pricing Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full mt-16 md:mt-24">
      <ScrollReveal
        v-for="(tier, idx) in tiers"
        :key="tier.key"
        direction="up"
        :delay="idx * 120"
        :duration="700"
      >
        <div
          class="glass-panel p-8 rounded-[2rem] flex flex-col relative transition-transform duration-300 hover:scale-[1.02] h-full"
          :class="tier.highlighted ? 'border-[color:var(--color-accent)]/50 bg-[color:var(--color-accent)]/10 shadow-2xl' : 'bg-[var(--color-surface)]/60 border border-[color:var(--color-border-dark)]'"
        >
          <div class="mb-8">
            <p class="text-sm font-medium text-muted-foreground mb-2">{{ tier.name }}</p>
            <h3 class="font-heading text-4xl font-bold text-foreground tracking-tight">{{ tier.price }}</h3>
          </div>
          
          <ul class="space-y-4 mb-10 flex-grow">
            <li v-for="f in tier.features" :key="f" class="flex items-start gap-3 text-sm text-muted-foreground">
              <div class="mt-0.5 bg-foreground/10 p-0.5 rounded-full shrink-0 flex items-center justify-center h-4 w-4">
                <CheckIcon class="w-3 h-3 text-foreground" />
              </div>
              <span>{{ f }}</span>
            </li>
          </ul>
          
          <Button
            class="w-full rounded-full py-6 text-sm font-semibold transition-colors cursor-pointer"
            :class="tier.highlighted ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-emerald-950/20' : 'bg-transparent text-foreground hover:bg-foreground/5 border border-[color:var(--color-border-dark)]'"
          >
            {{ $t('landing.pricing.getStarted') }}
          </Button>
        </div>
      </ScrollReveal>
    </div>

    <!-- Toggle Billed Yearly -->
    <ScrollReveal direction="up" :delay="400">
      <div class="flex justify-center mt-12 relative z-10 select-none">
        <div class="inline-flex items-center p-1.5 bg-[var(--color-surface)]/80 rounded-full border border-[color:var(--color-border-dark)] shadow-xl backdrop-blur-md">
          <button
            type="button"
            @click="isYearly = false"
            class="px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
            :class="!isYearly ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'"
          >
            {{ $t('landing.pricing.monthly') }}
          </button>
          <button
            type="button"
            @click="isYearly = true"
            class="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
            :class="isYearly ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'"
          >
            {{ $t('landing.pricing.annually') }}
            <span class="px-2.5 py-0.5 text-[11px] font-bold rounded-md shadow-sm border border-primary/20" :class="isYearly ? 'bg-white/20 text-white' : 'bg-primary text-primary-foreground'">
              {{ $t('landing.pricing.save25') }}
            </span>
          </button>
        </div>
      </div>
    </ScrollReveal>
  </section>
</template>
