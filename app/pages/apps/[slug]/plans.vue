<!-- app/pages/apps/[slug]/plans.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { LayersIcon, PlusIcon, Trash2Icon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { formatCurrency } from '~/utils/format'
import TheSubTabs from '~/components/layout/TheSubTabs.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? '')
const { plans, createPlan, deletePlan } = usePlans(appId.value)

const createOpen = ref(false)
const name = ref('')
const price = ref(0)
const intervalVal = ref<'month' | 'year'>('month')

function handleCreate() {
  if (!name.value.trim()) return
  createPlan({ name: name.value.trim(), price: price.value, interval: intervalVal.value, features: [] })
  name.value = ''
  price.value = 0
  createOpen.value = false
}
</script>

<template>
  <div>
    <TheSubTabs />
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm text-slate-400">{{ plans.length }} plan{{ plans.length === 1 ? '' : 's' }}</span>
      <Button class="cursor-pointer gap-1" @click="createOpen = true">
        <PlusIcon class="w-4 h-4" /> New plan
      </Button>
    </div>

    <EmptyState
      v-if="plans.length === 0"
      :icon="LayersIcon"
      title="No plans yet"
      description="Create a plan to start billing subscribers."
      cta-label="New plan"
      @cta="createOpen = true"
    />

    <div v-else class="space-y-3">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="flex items-center justify-between p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-dark)]"
      >
        <div>
          <div class="font-medium">{{ plan.name }}</div>
          <div class="text-sm text-slate-400">{{ formatCurrency(plan.price) }} / {{ plan.interval }}</div>
        </div>
        <button class="text-slate-400 hover:text-red-400 cursor-pointer" :aria-label="`Delete ${plan.name}`" @click="deletePlan(plan.id)">
          <Trash2Icon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <Dialog v-model:open="createOpen">
      <DialogContent>
        <DialogHeader><DialogTitle>New plan</DialogTitle></DialogHeader>
        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label for="plan-name">Name</Label>
            <Input id="plan-name" v-model="name" placeholder="Pro" />
          </div>
          <div class="space-y-2">
            <Label for="plan-price">Price (USD)</Label>
            <Input id="plan-price" v-model.number="price" type="number" min="0" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" @click="createOpen = false">Cancel</Button>
          <Button class="cursor-pointer" :disabled="!name.trim()" @click="handleCreate">Create plan</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
