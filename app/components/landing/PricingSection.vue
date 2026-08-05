<!-- app/components/landing/PricingSection.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '~/components/ui/button'
import { CheckIcon } from '@lucide/vue'
import ScrollReveal from '~/components/landing/ScrollReveal.vue'

const isYearly = ref(false)

const tiers = [
  { 
    name: 'Free Plan', 
    price: 'Free', 
    features: [
      'Send up to 2 transfers per month', 
      'Basic transaction history', 
      'Email support', 
      'Limited currency support (NGN, ZAR, KES)', 
      'Basic security features'
    ], 
    highlighted: false 
  },
  { 
    name: 'Standard Plan', 
    price: '$9.99/m', 
    features: [
      'Unlimited transfers', 
      'Transaction history with export options', 
      'Priority email support', 
      'Expanded African currency support', 
      'Advanced security features'
    ], 
    highlighted: true 
  },
  { 
    name: 'Pro Plan', 
    price: '$19.99/m', 
    features: [
      'Unlimited transfers with priority processing', 
      'Comprehensive transaction analytics', 
      '24/7 priority support', 
      'Full African currency support', 
      'Enhanced security features'
    ], 
    highlighted: false 
  },
]
</script>

<template>
  <section id="pricing" class="relative max-w-6xl mx-auto px-6 py-32 overflow-hidden flex flex-col items-center">
    <!-- Huge background text -->
    <div class="absolute inset-0 flex items-start pt-16 justify-center pointer-events-none select-none -z-10">
      <h2 class="text-[12rem] md:text-[18rem] font-bold text-white/5 tracking-tighter mix-blend-overlay leading-none">Pricing</h2>
    </div>

    <!-- Pricing Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full mt-16 md:mt-24">
      <ScrollReveal
        v-for="(tier, idx) in tiers"
        :key="tier.name"
        direction="up"
        :delay="idx * 120"
        :duration="700"
      >
        <div
          class="glass-panel p-8 rounded-[2rem] flex flex-col relative transition-transform duration-300 hover:scale-[1.02] h-full"
          :class="tier.highlighted ? 'border-[color:var(--color-accent)]/50 bg-[color:var(--color-accent)]/10 shadow-2xl' : 'bg-white/5'"
        >
          <div class="mb-8">
            <p class="text-sm font-medium text-zinc-400 mb-2">{{ tier.name }}</p>
            <h3 class="font-heading text-4xl font-bold text-white tracking-tight">{{ tier.price }}</h3>
          </div>
          
          <ul class="space-y-4 mb-10 flex-grow">
            <li v-for="f in tier.features" :key="f" class="flex items-start gap-3 text-sm text-zinc-300">
              <div class="mt-0.5 bg-white/10 p-0.5 rounded-full shrink-0 flex items-center justify-center h-4 w-4">
                <CheckIcon class="w-3 h-3 text-white" />
              </div>
              <span>{{ f }}</span>
            </li>
          </ul>
          
          <Button 
            class="w-full rounded-full py-6 text-sm font-semibold transition-colors cursor-pointer" 
            :class="tier.highlighted ? 'bg-white text-black hover:bg-zinc-200' : 'bg-transparent text-white hover:bg-white/10 border border-white/20'"
          >
            Get Started
          </Button>
        </div>
      </ScrollReveal>
    </div>

    <!-- Toggle Billed Yearly -->
    <ScrollReveal direction="up" :delay="400">
      <div
        class="flex items-center justify-center gap-3 mt-12 relative z-10 bg-slate-900/90 px-6 py-3 rounded-full border border-slate-800 shadow-xl backdrop-blur-md cursor-pointer select-none"
        @click="isYearly = !isYearly"
      >
        <button
          type="button"
          role="switch"
          :aria-checked="isYearly"
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          :class="isYearly ? 'bg-emerald-500' : 'bg-slate-700'"
        >
          <span
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
            :class="isYearly ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
        <span class="text-sm font-medium text-slate-200">
          Billed Yearly
        </span>
        <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Save 20%
        </span>
      </div>
    </ScrollReveal>
  </section>
</template>
