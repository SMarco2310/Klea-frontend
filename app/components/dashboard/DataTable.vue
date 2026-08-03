<!-- app/components/dashboard/DataTable.vue -->
<script setup lang="ts">
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '~/components/ui/table'

defineProps<{
  columns: { key: string; label: string }[]
  rows: Record<string, unknown>[]
}>()
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead v-for="col in columns" :key="col.key">{{ col.label }}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="(row, i) in rows" :key="i">
        <TableCell v-for="col in columns" :key="col.key">
          <slot :name="`cell-${col.key}`" :row="row">{{ row[col.key] }}</slot>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
