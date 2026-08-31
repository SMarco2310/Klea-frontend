<!-- app/components/dashboard/IdentityCell.vue -->
<script setup lang="ts">
/**
 * An identifying value with a coloured initial, so rows are scannable by shape
 * rather than by reading every string.
 *
 * The colour is derived from the text, not random, so the same subscriber keeps
 * the same colour across pages and reloads.
 */
const props = defineProps<{
  value: string | null | undefined
  /** Optional second line, e.g. an external id or phone number. */
  sub?: string | null
}>()

const TONES = [
  'bg-sky-500/15 text-sky-400',
  'bg-emerald-500/15 text-emerald-400',
  'bg-amber-500/15 text-amber-400',
  'bg-violet-500/15 text-violet-400',
  'bg-rose-500/15 text-rose-400',
]

const display = computed(() => props.value?.trim() || '—')

const initial = computed(() => {
  const v = props.value?.trim()
  // A leading non-letter (an id starting with a digit) is still a fine initial.
  return v ? v[0]!.toUpperCase() : '?'
})

const tone = computed(() => {
  const v = props.value?.trim()
  if (!v) return 'bg-slate-500/15 text-slate-400'

  // Deterministic: same input always yields the same tone.
  let hash = 0
  for (let i = 0; i < v.length; i++) hash = (hash * 31 + v.charCodeAt(i)) >>> 0

  return TONES[hash % TONES.length]!
})
</script>

<template>
  <div class="flex items-center gap-3 min-w-0">
    <span
      class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
      :class="tone"
      aria-hidden="true"
    >{{ initial }}</span>
    <span class="min-w-0">
      <span class="block truncate">{{ display }}</span>
      <span v-if="sub" class="block text-xs text-[var(--muted-foreground)] truncate">{{ sub }}</span>
    </span>
  </div>
</template>
