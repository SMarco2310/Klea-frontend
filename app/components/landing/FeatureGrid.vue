<!-- app/components/landing/FeatureGrid.vue -->
<script setup lang="ts">
import { KeyIcon, FlaskConicalIcon, WebhookIcon, LayersIcon, BarChart3Icon, CreditCardIcon } from '@lucide/vue'
import ScrollReveal from '~/components/landing/ScrollReveal.vue'

const { t } = useI18n()

const items = computed(() => [
  { icon: KeyIcon, path: '/v1/licenses', titleKey: 'landing.features.apiFirst.title', descKey: 'landing.features.apiFirst.desc' },
  { icon: FlaskConicalIcon, path: '/v1/mode', titleKey: 'landing.features.testLive.title', descKey: 'landing.features.testLive.desc' },
  { icon: WebhookIcon, path: '/v1/webhooks', titleKey: 'landing.features.webhooks.title', descKey: 'landing.features.webhooks.desc' },
  { icon: LayersIcon, path: '/v1/plans', titleKey: 'landing.features.plans.title', descKey: 'landing.features.plans.desc' },
  { icon: BarChart3Icon, path: '/v1/analytics', titleKey: 'landing.features.analytics.title', descKey: 'landing.features.analytics.desc' },
  { icon: CreditCardIcon, path: '/v1/payments', titleKey: 'landing.features.wallet.title', descKey: 'landing.features.wallet.desc' },
].map((item) => ({ ...item, title: t(item.titleKey), desc: t(item.descKey) })))
</script>

<template>
  <section id="features" class="max-w-6xl mx-auto px-6 py-24">
    <ScrollReveal direction="up" :duration="700">
      <div class="text-center mb-14">
        <span class="text-xs font-mono text-[var(--color-accent)] uppercase tracking-widest">{{ $t('landing.features.eyebrow') }}</span>
        <h2 class="font-heading text-3xl md:text-4xl font-semibold mt-3 tracking-[-0.015em] leading-[1.15]">{{ $t('landing.features.title') }}</h2>
      </div>
    </ScrollReveal>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <ScrollReveal
        v-for="(item, idx) in items"
        :key="item.titleKey"
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
