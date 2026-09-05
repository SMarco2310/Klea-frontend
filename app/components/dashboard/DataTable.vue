<!-- app/components/dashboard/DataTable.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
import type { Component } from 'vue'
import { SearchIcon } from '@lucide/vue'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '~/components/ui/table'
import { Input } from '~/components/ui/input'

const { t } = useI18n()

const props = defineProps<{
  /** `icon` and `searchable` are optional — existing callers work unchanged. */
  /**
   * `searchable: true` matches the column's own key; pass a dotted path
   * instead when the value lives on a nested record (e.g. subscriber.email).
   */
  columns: { key: string; label: string; icon?: Component; searchable?: boolean | string }[]
  rows: T[]
  /** Shows a filter box above the table. Omit for short, fixed lists. */
  searchPlaceholder?: string
}>()

const query = ref('')

// Only columns marked searchable are matched, so a filter never silently hits a
// field the reader cannot see in the table.
const searchableKeys = computed(() =>
  props.columns
    .filter((c) => c.searchable)
    .map((c) => (typeof c.searchable === 'string' ? c.searchable : c.key)),
)

const visibleRows = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q || searchableKeys.value.length === 0) return props.rows

  // Dotted keys resolve nested fields (e.g. "subscriber.email"), which is where
  // the searchable value often lives on a joined record.
  const read = (row: T, key: string) =>
    key.split('.').reduce<any>((val, part) => (val == null ? val : val[part]), row)

  return props.rows.filter((row) =>
    searchableKeys.value.some((key) => String(read(row, key) ?? '').toLowerCase().includes(q)),
  )
})
</script>

<template>
  <div>
    <div v-if="searchPlaceholder && searchableKeys.length" class="mb-4 relative max-w-sm">
      <SearchIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
      <Input v-model="query" :placeholder="searchPlaceholder" class="pl-9 h-10" />
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-for="col in columns" :key="col.key">
            <span class="inline-flex items-center gap-2">
              <component :is="col.icon" v-if="col.icon" class="w-4 h-4 text-[var(--muted-foreground)]" />
              {{ col.label }}
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(row, i) in visibleRows" :key="i">
          <TableCell v-for="col in columns" :key="col.key">
            <slot :name="`cell-${col.key}`" :row="row">{{ row[col.key] }}</slot>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- Distinct from the page's own empty state: the list has rows, the filter
         just matched none of them. Telling the two apart matters. -->
    <p v-if="query && visibleRows.length === 0" class="text-sm text-[var(--muted-foreground)] text-center py-8">
      {{ t('common.noResultsFor', { query }) }}
    </p>
  </div>
</template>
