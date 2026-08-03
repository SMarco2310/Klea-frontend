<!-- app/components/landing/PricingSection.vue -->
<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { CheckIcon } from '@lucide/vue'

const tiers = [
  { name: 'Starter', price: '$0', desc: 'For side projects', features: ['1 app', '100 subscribers', 'Test mode'] },
  { name: 'Growth', price: '$49', desc: 'For growing SaaS', features: ['Unlimited apps', '10,000 subscribers', 'Webhooks'], highlighted: true },
  { name: 'Scale', price: 'Custom', desc: 'For high volume', features: ['Unlimited everything', 'Priority support', 'SLA'] },
]
</script>

<template>
  <section id="pricing" class="max-w-5xl mx-auto px-6 py-20">
    <h2 class="font-heading text-3xl font-semibold text-center mb-12">Simple, predictable pricing</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="tier in tiers"
        :key="tier.name"
        class="p-6 rounded-xl border"
        :class="tier.highlighted
          ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]'
          : 'bg-[var(--color-surface)] border-[var(--color-border-dark)]'"
      >
        <h3 class="font-heading font-semibold text-lg">{{ tier.name }}</h3>
        <p class="text-sm text-slate-400 mb-4">{{ tier.desc }}</p>
        <p class="font-heading text-3xl font-bold mb-4">{{ tier.price }}</p>
        <ul class="space-y-2 mb-6">
          <li v-for="f in tier.features" :key="f" class="flex items-center gap-2 text-sm text-slate-300">
            <CheckIcon class="w-4 h-4 text-[var(--color-accent)]" /> {{ f }}
          </li>
        </ul>
        <Button as-child class="w-full cursor-pointer" :variant="tier.highlighted ? 'default' : 'secondary'">
          <NuxtLink to="/signup">Get started</NuxtLink>
        </Button>
      </div>
    </div>
  </section>
</template>
