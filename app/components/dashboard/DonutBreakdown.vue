<!-- app/components/dashboard/DonutBreakdown.vue -->
<script setup lang="ts">
/**
 * A donut whose hole carries the total, with the legend beneath it.
 *
 * A bare donut with a colour-only legend makes the reader estimate proportions
 * by eye and never shows the counts they came for — so the total sits in the
 * hole (the biggest piece of dead space in the default chart) and each legend
 * row carries its value and share.
 */
const props = defineProps<{
  values: number[]
  categories: Record<string, { name: string; color: string }>
  /** What the total counts, e.g. "subscriptions". Shown under the number. */
  totalLabel: string
}>()

const total = computed(() => props.values.reduce((sum, n) => sum + n, 0))

const rows = computed(() =>
  Object.values(props.categories).map((cat, i) => {
    const value = props.values[i] ?? 0

    return {
      name: cat.name,
      color: cat.color,
      value,
      // Guard the divide: an all-zero dataset would otherwise render NaN%.
      percent: total.value > 0 ? Math.round((value / total.value) * 100) : 0,
    }
  }),
)
</script>

<template>
  <div class="flex-grow flex flex-col items-center justify-center gap-5">
    <div class="relative shrink-0">
      <!-- padAngle separates the segments, so adjacent slices read as distinct
           blocks rather than one continuous ring. -->
      <DonutChart
        :data="values"
        :radius="78"
        :arc-width="26"
        :pad-angle="0.06"
        :categories="categories"
        :hide-legend="true"
      />
      <!-- pointer-events-none so the label never blocks the chart's own hover. -->
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-3xl font-semibold leading-none tabular-nums">{{ total }}</span>
        <span class="text-xs text-[var(--muted-foreground)] mt-1.5">{{ totalLabel }}</span>
      </div>
    </div>

    <ul class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      <li v-for="row in rows" :key="row.name" class="flex items-center gap-2 text-sm">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: row.color }" />
        <span class="text-[var(--muted-foreground)]">{{ row.name }}</span>
        <span class="font-medium tabular-nums">{{ row.value }}</span>
        <span class="text-xs text-[var(--muted-foreground)] tabular-nums">({{ row.percent }}%)</span>
      </li>
    </ul>
  </div>
</template>
