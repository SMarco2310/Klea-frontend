<!-- app/components/dashboard/DonutBreakdown.vue -->
<script setup lang="ts">
/**
 * A donut whose hole carries the total, with the legend beneath it.
 *
 * Hand-rolled SVG rather than vue-chrts' DonutChart: that component hardcodes
 * corner-radius to the donut radius (DonutChart.js:82) with no prop to
 * override it, so any gap between segments exposes heavily rounded pill ends.
 * Drawing the arcs as filled paths gives square ends by construction.
 */
const props = defineProps<{
  values: number[]
  categories: Record<string, { name: string; color: string }>
  /** What the total counts, e.g. "subscriptions". Shown under the number. */
  totalLabel: string
}>()

const SIZE = 180
const R_OUTER = 84
const R_INNER = 58
const GAP_DEGREES = 3

const total = computed(() => props.values.reduce((sum, n) => sum + n, 0))

const catList = computed(() => Object.values(props.categories))

/** A donut segment: outer arc forward, straight edge in, inner arc back, close. */
function segmentPath(startAngle: number, endAngle: number): string {
  const c = SIZE / 2
  const pt = (r: number, a: number) => [c + r * Math.cos(a), c + r * Math.sin(a)]
  const large = endAngle - startAngle > Math.PI ? 1 : 0

  const [x0, y0] = pt(R_OUTER, startAngle)
  const [x1, y1] = pt(R_OUTER, endAngle)
  const [x2, y2] = pt(R_INNER, endAngle)
  const [x3, y3] = pt(R_INNER, startAngle)

  return `M${x0} ${y0}A${R_OUTER} ${R_OUTER} 0 ${large} 1 ${x1} ${y1}`
    + `L${x2} ${y2}A${R_INNER} ${R_INNER} 0 ${large} 0 ${x3} ${y3}Z`
}

const segments = computed(() => {
  if (total.value <= 0) return []

  const gap = (GAP_DEGREES * Math.PI) / 180
  let angle = -Math.PI / 2 // start at 12 o'clock
  const out: Array<{ d: string; color: string }> = []

  props.values.forEach((value, i) => {
    const sweep = (value / total.value) * Math.PI * 2
    const cat = catList.value[i]

    // Skip zero slices, and any so thin the gap would invert them.
    if (value > 0 && sweep > gap && cat) {
      out.push({ d: segmentPath(angle + gap / 2, angle + sweep - gap / 2), color: cat.color })
    }
    angle += sweep
  })

  return out
})

const rows = computed(() =>
  catList.value.map((cat, i) => {
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
    <div class="relative shrink-0" :style="{ width: `${SIZE}px`, height: `${SIZE}px` }">
      <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" :width="SIZE" :height="SIZE" role="img"
           :aria-label="`${total} ${totalLabel}`">
        <path v-for="(seg, i) in segments" :key="i" :d="seg.d" :fill="seg.color" />
      </svg>
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
