<!-- app/components/dashboard/DonutBreakdown.vue -->
<script setup lang="ts">
/**
 * A donut with the total in its hole and a legend that carries the actual
 * numbers. A bare donut with a colour-only legend makes the reader estimate
 * proportions by eye and never shows the counts they came for.
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
  <div class="flex-grow flex flex-col sm:flex-row items-center justify-center gap-6">
    <div class="relative shrink-0">
      <DonutChart :data="values" :radius="62" :arc-width="16" :categories="categories" :hide-legend="true" />
      <!-- The hole is dead space in the default chart; the total belongs there.
           pointer-events-none so it never blocks the chart's own hover. -->
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-2xl font-semibold leading-none">{{ total }}</span>
        <span class="text-[11px] text-[var(--muted-foreground)] mt-1">{{ totalLabel }}</span>
      </div>
    </div>

    <ul class="w-full sm:w-auto sm:min-w-[150px] space-y-2.5">
      <li v-for="row in rows" :key="row.name" class="flex items-center gap-2.5 text-sm">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: row.color }" />
        <span class="flex-1 truncate text-[var(--muted-foreground)]">{{ row.name }}</span>
        <span class="font-medium tabular-nums">{{ row.value }}</span>
        <span class="text-xs text-[var(--muted-foreground)] tabular-nums w-9 text-right">{{ row.percent }}%</span>
      </li>
    </ul>
  </div>
</template>
