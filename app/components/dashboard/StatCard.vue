<!-- app/components/dashboard/StatCard.vue -->
<script setup lang="ts">
import type { Component } from 'vue'
import { TrendingUpIcon, TrendingDownIcon } from '@lucide/vue'

const props = defineProps<{
  label: string
  value: string | number | null
  icon: Component
  sublabel?: string
  /** % change vs the previous period. Omit or pass null to hide. */
  delta?: number | null
  /** Recent history for the inline sparkline. Needs 2+ points to render. */
  trend?: { date: string; amount: number }[]
  valueClass?: string
}>()

const showTrend = computed(() => (props.trend?.length ?? 0) > 1)
</script>

<template>
  <div class="p-7 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)]">
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm uppercase tracking-wide text-[var(--muted-foreground)]">{{ label }}</span>
      <component :is="icon" class="w-5 h-5 text-[var(--muted-foreground)]" />
    </div>
    <div class="flex items-end justify-between gap-3">
      <div class="min-w-0">
        <div class="text-4xl font-heading font-bold" :class="valueClass">{{ value === null ? '—' : value }}</div>
        <div v-if="sublabel" class="text-sm text-[var(--muted-foreground)] mt-1.5">{{ sublabel }}</div>
        <div
          v-if="delta !== null && delta !== undefined"
          class="flex items-center gap-1 text-sm font-medium mt-2"
          :class="delta >= 0 ? 'text-emerald-400' : 'text-red-400'"
        >
          <component :is="delta >= 0 ? TrendingUpIcon : TrendingDownIcon" class="w-3.5 h-3.5" />
          {{ delta >= 0 ? '+' : '' }}{{ delta }}% vs last month
        </div>
      </div>
      <div v-if="showTrend" class="w-20 h-10 shrink-0 -mb-1">
        <LineChart
          :data="trend || []"
          :categories="{ amount: { name: label, color: 'var(--color-accent)' } }"
          :height="40"
          :padding="{ top: 2, right: 2, bottom: 2, left: 2 }"
          :hide-legend="true"
          :hide-tooltip="true"
          :hide-x-axis="true"
          :hide-y-axis="true"
          :line-width="1.5"
        />
      </div>
    </div>
  </div>
</template>
