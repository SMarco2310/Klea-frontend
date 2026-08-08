<!-- app/pages/apps/[slug]/plans.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { LayersIcon, PlusIcon, PencilIcon, Trash2Icon, CheckIcon, EyeIcon, LayoutListIcon, InfoIcon, GripVerticalIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { formatCurrency } from '~/utils/format'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'
import PlanPreviewGrid from '~/components/plans/PlanPreviewGrid.vue'
import type { Plan } from '~/composables/usePlans'
import type { Feature } from '~/composables/useFeatures'
import { toast } from 'vue-sonner'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)
const { plans, pending, fetchPlans, createPlan, updatePlan, deletePlan, reorderPlans, attachFeature, detachFeature } = usePlans(appId.value)
const { features, fetchFeatures } = useFeatures(appId.value)

watchEffect(() => {
  if (appId.value) {
    fetchPlans()
    fetchFeatures()
  }
})

const CURRENCIES = [
  { code: 'TND', label: 'TND (DT)' },
  { code: 'NGN', label: 'NGN (₦)' },
  { code: 'ZAR', label: 'ZAR (R)' },
  { code: 'KES', label: 'KES (KSh)' },
  { code: 'GHS', label: 'GHS (₵)' },
  { code: 'EGP', label: 'EGP (E£)' },
  { code: 'MAD', label: 'MAD (MAD)' },
  { code: 'XOF', label: 'XOF (CFA)' },
  { code: 'XAF', label: 'XAF (FCFA)' },
]

const viewMode = ref<'list' | 'preview'>('list')
const errorMessage = ref('')
const isSaving = ref(false)

const modalOpen = ref(false)
const editingPlanId = ref<number | null>(null)
const name = ref('')
const price = ref(0)
const currencyVal = ref('NGN')
const intervalVal = ref<'month' | 'year'>('month')
const yearlyDiscountVal = ref(20)
const selectedFeatureIds = ref<number[]>([])

// Drag and drop state
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(event: DragEvent, index: number) {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

function onDragEnter(index: number) {
  if (draggedIndex.value !== null) {
    dragOverIndex.value = index
  }
}

async function onDrop(event: DragEvent, index: number) {
  if (draggedIndex.value === null || draggedIndex.value === index) {
    draggedIndex.value = null
    dragOverIndex.value = null
    return
  }

  const newPlans = [...plans.value]
  const [removed] = newPlans.splice(draggedIndex.value, 1)
  newPlans.splice(index, 0, removed)

  draggedIndex.value = null
  dragOverIndex.value = null
  try {
    await reorderPlans(newPlans)
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  }
}

function onDragEnd() {
  draggedIndex.value = null
  dragOverIndex.value = null
}

function openCreateModal() {
  editingPlanId.value = null
  name.value = ''
  price.value = 0
  currencyVal.value = 'NGN'
  intervalVal.value = 'month'
  yearlyDiscountVal.value = 20
  selectedFeatureIds.value = []
  errorMessage.value = ''
  modalOpen.value = true
}

function openEditModal(plan: Plan) {
  editingPlanId.value = plan.id
  name.value = plan.name
  price.value = plan.price
  currencyVal.value = plan.currency || 'NGN'
  intervalVal.value = plan.duration_days >= 180 ? 'year' : 'month'
  yearlyDiscountVal.value = plan.yearly_discount_percent ?? 20
  selectedFeatureIds.value = (plan.features ?? []).map((f) => f.id)
  errorMessage.value = ''
  modalOpen.value = true
}

function toggleFeature(featureId: number) {
  const index = selectedFeatureIds.value.indexOf(featureId)
  if (index > -1) {
    selectedFeatureIds.value.splice(index, 1)
  } else {
    selectedFeatureIds.value.push(featureId)
  }
}

function isFeatureSelected(featureId: number) {
  return selectedFeatureIds.value.includes(featureId)
}

async function handleSave(publish: boolean) {
  if (!name.value.trim()) return

  isSaving.value = true
  errorMessage.value = ''
  try {
    const durationDays = intervalVal.value === 'year' ? 365 : 30
    let plan: Plan
    if (editingPlanId.value) {
      plan = await updatePlan(editingPlanId.value, {
        name: name.value.trim(),
        price: price.value,
        currency: currencyVal.value,
        duration_days: durationDays,
        yearly_discount_percent: yearlyDiscountVal.value,
        is_active: publish,
      })
      toast.success(publish ? 'Plan published successfully' : 'Plan saved as draft')
    } else {
      plan = await createPlan({
        name: name.value.trim(),
        price: price.value,
        currency: currencyVal.value,
        duration_days: durationDays,
        yearly_discount_percent: yearlyDiscountVal.value,
        is_active: publish,
      })
      toast.success(publish ? 'Plan published successfully' : 'Plan saved as draft')
    }

    // Sync feature attachments: attach newly selected, detach unselected.
    const currentFeatureIds = new Set((plan.features ?? []).map((f) => f.id))
    const toAttach = selectedFeatureIds.value.filter((id) => !currentFeatureIds.has(id))
    const toDetach = [...currentFeatureIds].filter((id) => !selectedFeatureIds.value.includes(id))
    for (const featureId of toAttach) await attachFeature(plan.id, featureId)
    for (const featureId of toDetach) await detachFeature(plan.id, featureId)

    modalOpen.value = false
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isSaving.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await deletePlan(id)
    toast.success('Plan deleted successfully')
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  }
}
</script>

<template>
  <div>
    <AppHeader title="Plans">
      <template #subtitle>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-400">{{ plans.length }} plan{{ plans.length === 1 ? '' : 's' }}</span>

          <!-- View mode switcher -->
          <div class="inline-flex p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              class="flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer"
              :class="viewMode === 'list' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
              @click="viewMode = 'list'"
            >
              <LayoutListIcon class="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              class="flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer"
              :class="viewMode === 'preview' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
              @click="viewMode = 'preview'"
            >
              <EyeIcon class="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </template>
      <template #actions>
        <Button class="cursor-pointer gap-1" @click="openCreateModal">
          <PlusIcon class="w-4 h-4" /> New plan
        </Button>
      </template>
    </AppHeader>

    <div class="mb-5 p-3.5 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-start gap-3">
      <InfoIcon class="w-5 h-5 mt-0.5 text-sky-400 shrink-0" />
      <div>
        <h4 class="text-sm font-medium text-sky-300 mb-0.5">Currency Configuration</h4>
        <p class="text-xs text-sky-400/80 leading-relaxed">Ensure all active plans use the same currency. Mixing different currencies for a single application can cause checkout issues.</p>
      </div>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <!-- Live Preview View -->
    <template v-if="viewMode === 'preview'">
      <PlanPreviewGrid :plans="plans" :features="features" />
    </template>

    <!-- List View -->
    <template v-else>
      <p v-if="pending" class="text-sm text-slate-400">Loading plans...</p>

      <EmptyState
        v-else-if="plans.length === 0"
        :icon="LayersIcon"
        title="No plans yet"
        description="Create a plan to start billing subscribers."
        cta-label="New plan"
        @cta="openCreateModal"
      />

      <div v-else class="space-y-3">
        <div
          v-for="(plan, index) in plans"
          :key="plan.id"
          class="p-4 rounded-lg bg-[var(--color-surface)] border space-y-3 transition-all duration-200 cursor-grab active:cursor-grabbing"
          :class="[
            dragOverIndex === index ? 'border-teal-500/50 bg-teal-500/5' : 'border-[var(--color-border-dark)]',
            draggedIndex === index ? 'opacity-50 scale-[0.98]' : 'opacity-100'
          ]"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragenter.prevent="onDragEnter(index)"
          @dragover.prevent
          @drop="onDrop($event, index)"
          @dragend="onDragEnd"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-start gap-3">
              <div class="mt-1 text-slate-500 hidden sm:block opacity-50 hover:opacity-100 transition-opacity">
                <GripVerticalIcon class="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-lg text-slate-100">{{ plan.name }}</span>
                  <span v-if="!plan.is_active" class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/30">
                    Draft
                  </span>
                  <span v-else class="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Published
                  </span>
                  <span v-if="(plan.yearly_discount_percent ?? 0) > 0" class="px-2 py-0.5 rounded text-[11px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/30">
                    {{ plan.yearly_discount_percent }}% annual discount
                  </span>
                </div>
                <div class="text-sm text-slate-400">
                  {{ formatCurrency(plan.price, plan.currency || 'NGN') }} / {{ plan.duration_days >= 180 ? 'year' : 'month' }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button
                class="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                :aria-label="`Edit ${plan.name}`"
                @click="openEditModal(plan)"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                class="text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
                :aria-label="`Delete ${plan.name}`"
                @click="handleDelete(plan.id)"
              >
                <Trash2Icon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Features list on plan card -->
          <div class="pt-2 border-t border-[var(--color-border-dark)]/60">
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Included Features</div>
            <div v-if="!plan.features || plan.features.length === 0" class="text-xs text-slate-500 italic">
              No features included in this plan
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <span
                v-for="feat in plan.features"
                :key="feat.id"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-200 border border-slate-700/60"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                <span>{{ feat.name }}</span>
                <span class="font-mono text-[10px] text-slate-400">({{ feat.code }})</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Create/Edit Plan Dialog -->
    <Dialog v-model:open="modalOpen">
      <DialogContent class="max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{{ editingPlanId ? 'Edit plan' : 'New plan' }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-4 py-2 overflow-y-auto pr-1">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label for="plan-name">Plan Name</Label>
              <Input id="plan-name" v-model="name" placeholder="Pro" />
            </div>

            <div class="space-y-2">
              <Label for="plan-discount">Yearly Discount (%)</Label>
              <Input id="plan-discount" v-model.number="yearlyDiscountVal" type="number" min="0" max="100" placeholder="20" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-2">
              <Label for="plan-price">Price</Label>
              <Input id="plan-price" v-model.number="price" type="number" min="0" />
            </div>

            <div class="space-y-2">
              <Label for="plan-currency">Currency</Label>
              <Select v-model="currencyVal">
                <SelectTrigger id="plan-currency">
                  <SelectValue placeholder="NGN" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="c in CURRENCIES" :key="c.code" :value="c.code">
                    {{ c.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="plan-interval">Interval</Label>
              <Select v-model="intervalVal">
                <SelectTrigger id="plan-interval">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Feature Selection Section -->
          <div class="space-y-2 pt-2">
            <Label class="text-sm font-medium">Select Features</Label>
            <p class="text-xs text-slate-400">Choose which features are included in this plan</p>

            <div v-if="features.length === 0" class="p-4 rounded-lg bg-slate-900/50 border border-slate-800 text-center">
              <p class="text-xs text-slate-400">No features created yet.</p>
              <NuxtLink :to="`/apps/${currentApp?.slug}/features`" class="text-xs text-teal-400 hover:underline mt-1 inline-block">
                Create features first
              </NuxtLink>
            </div>

            <div v-else class="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div
                v-for="feature in features"
                :key="feature.id"
                class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150"
                :class="[
                  isFeatureSelected(feature.id)
                    ? 'bg-teal-500/10 border-teal-500/50 text-slate-100'
                    : 'bg-[var(--color-surface)] border-[var(--color-border-dark)] text-slate-300 hover:border-slate-600'
                ]"
                @click="toggleFeature(feature.id)"
              >
                <div
                  class="w-5 h-5 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-colors"
                  :class="[
                    isFeatureSelected(feature.id)
                      ? 'bg-teal-500 border-teal-500 text-slate-950'
                      : 'border-slate-600 bg-slate-900/50'
                  ]"
                >
                  <CheckIcon v-if="isFeatureSelected(feature.id)" class="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div class="space-y-1 min-w-0 flex-1">
                  <!-- Name on top -->
                  <div class="font-medium text-sm text-slate-100 leading-tight">{{ feature.name }}</div>
                  <!-- Code / Key -->
                  <div class="flex items-center gap-1.5">
                    <span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-teal-400 border border-slate-700/60">
                      {{ feature.code }}
                    </span>
                  </div>
                  <!-- Description -->
                  <p class="text-xs text-slate-400 line-clamp-2">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {{ errorMessage }}
          </p>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-[var(--color-border-dark)] mt-2">
          <Button variant="ghost" class="cursor-pointer" @click="modalOpen = false">Cancel</Button>
          <Button variant="outline" class="cursor-pointer" :disabled="!name.trim() || isSaving" @click="handleSave(false)">
            {{ isSaving ? 'Saving...' : 'Save as Draft' }}
          </Button>
          <Button class="cursor-pointer" :disabled="!name.trim() || isSaving" @click="handleSave(true)">
            {{ isSaving ? 'Publishing...' : editingPlanId ? 'Publish Changes' : 'Publish Plan' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
