<!-- app/components/landing/FeatureGrid.vue -->
<script setup lang="ts">
import { KeyIcon, FlaskConicalIcon, WebhookIcon, LayersIcon, BarChart3Icon, CreditCardIcon } from '@lucide/vue'
import ScrollReveal from '~/components/landing/ScrollReveal.vue'

const items = [
  { icon: KeyIcon, path: '/v1/licenses', title: 'API-first licensing', desc: 'Issue and validate license keys with a few REST calls.' },
  { icon: FlaskConicalIcon, path: '/v1/mode', title: 'Test & Live modes', desc: 'Sandbox everything before it touches real payments.' },
  { icon: WebhookIcon, path: '/v1/webhooks', title: 'Webhooks', desc: 'Get notified the moment a subscription changes state.' },
  { icon: LayersIcon, path: '/v1/plans', title: 'Plans & features', desc: 'Model pricing tiers and gate features per plan.' },
  { icon: BarChart3Icon, path: '/v1/analytics', title: 'Analytics', desc: 'Track revenue, active subscribers, and success rate.' },
  { icon: CreditCardIcon, path: '/v1/payments', title: 'Payment gateway', desc: 'Connect your processor once, bill everywhere.' },
]
</script>

<template>
  <section id="features" class="max-w-6xl mx-auto px-6 py-24">
    <ScrollReveal direction="up" :duration="700">
      <div class="text-center mb-14">
        <span class="text-xs font-mono text-[var(--color-accent)] uppercase tracking-widest">The API surface</span>
        <h2 class="font-heading text-3xl md:text-4xl font-semibold mt-3 tracking-[-0.015em] leading-[1.15]">Everything you need to license software</h2>
      </div>
    </ScrollReveal>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <ScrollReveal
        v-for="(item, idx) in items"
        :key="item.title"
        direction="up"
        :delay="idx * 80"
        :duration="600"
      >
        <div class="surface-card surface-card--interactive rounded-xl p-6 h-full">
          <div class="flex items-center justify-between mb-5">
            <span class="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]/25 shadow-[0_0_16px_-4px_var(--color-accent)]">
              <component :is="item.icon" class="w-4.5 h-4.5 text-[var(--color-accent)]" />
            </span>
            <span class="text-[11px] font-mono text-muted-foreground">{{ item.path }}</span>
          </div>
          <h3 class="font-heading font-semibold mb-1.5">{{ item.title }}</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">{{ item.desc }}</p>
        </div>
      </ScrollReveal>
    </div>
  </section>
</template>
