<!-- app/components/landing/FeatureGrid.vue -->
<script setup lang="ts">
import { KeyIcon, FlaskConicalIcon, WebhookIcon, LayersIcon, BarChart3Icon, CreditCardIcon } from '@lucide/vue'

const items = [
  { icon: KeyIcon, title: 'API-first licensing', desc: 'Issue and validate license keys with a few REST calls.' },
  { icon: FlaskConicalIcon, title: 'Test & Live modes', desc: 'Sandbox everything before it touches real payments.' },
  { icon: WebhookIcon, title: 'Webhooks', desc: 'Get notified the moment a subscription changes state.' },
  { icon: LayersIcon, title: 'Plans & features', desc: 'Model pricing tiers and gate features per plan.' },
  { icon: BarChart3Icon, title: 'Analytics', desc: 'Track revenue, active subscribers, and success rate.' },
  { icon: CreditCardIcon, title: 'Payment gateway', desc: 'Connect your processor once, bill everywhere.' },
]
</script>

<template>
  <section id="features" class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="font-heading text-3xl font-semibold text-center mb-12">Everything you need to license software</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="item in items"
        :key="item.title"
        class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)]"
      >
        <component :is="item.icon" class="w-6 h-6 text-[var(--color-accent)] mb-4" />
        <h3 class="font-heading font-semibold mb-2">{{ item.title }}</h3>
        <p class="text-sm text-slate-400">{{ item.desc }}</p>
      </div>
    </div>
  </section>
</template>
