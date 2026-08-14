<!-- app/pages/apps/[slug]/plans/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { LayersIcon, PlusIcon, PencilIcon, Trash2Icon, EyeIcon, LayoutListIcon, InfoIcon, GripVerticalIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { formatCurrency } from '~/utils/format'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'
import PlanPreviewGrid from '~/components/plans/PlanPreviewGrid.vue'
import type { Plan } from '~/composables/usePlans'
import { toast } from 'vue-sonner'

const route = useRoute()
const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)
const { plans, pending, fetchPlans, deletePlan, reorderPlans, updatePlan } = usePlans(appId)
const { features, fetchFeatures } = useFeatures(appId)

watchEffect(() => {
  if (appId.value) {
    fetchPlans()
    fetchFeatures()
  }
})

const viewMode = ref<'list' | 'preview'>('list')
const errorMessage = ref('')

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
  if (removed) {
    newPlans.splice(index, 0, removed)
  }

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

function openCreatePage() {
  navigateTo(`/${route.params.workspaceSlug}/apps/${route.params.slug}/plans/new`)
}

function openEditPage(planId: number) {
  navigateTo(`/${route.params.workspaceSlug}/apps/${route.params.slug}/plans/${planId}`)
}

const pendingDeleteId = ref<number | null>(null)
const isDeleting = ref(false)

function promptDelete(id: number) {
  pendingDeleteId.value = id
}

async function confirmDelete() {
  if (!pendingDeleteId.value) return
  isDeleting.value = true
  try {
    await deletePlan(pendingDeleteId.value)
    toast.success('Plan deleted successfully')
    pendingDeleteId.value = null
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isDeleting.value = false
  }
}

async function togglePublish(plan: Plan) {
  const newStatus = !plan.is_active
  try {
    await updatePlan(plan.id, { is_active: newStatus })
    toast.success(newStatus ? 'Plan published successfully' : 'Plan moved to draft')
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
          <span class="text-sm text-[var(--muted-foreground)]">{{ plans.length }} plan{{ plans.length === 1 ? '' : 's' }}</span>

          <!-- View mode switcher -->
          <div class="inline-flex p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] text-xs">
            <button
              class="flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer"
              :class="viewMode === 'list' ? 'bg-[var(--color-surface)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
              @click="viewMode = 'list'"
            >
              <LayoutListIcon class="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              class="flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer"
              :class="viewMode === 'preview' ? 'bg-[var(--color-surface)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
              @click="viewMode = 'preview'"
            >
              <EyeIcon class="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </template>
      <template #actions>
        <Button class="cursor-pointer gap-1" @click="openCreatePage">
          <PlusIcon class="w-4 h-4" /> New plan
        </Button>
      </template>
    </AppHeader>

    <div class="mb-5 p-3.5 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-start gap-3">
      <InfoIcon class="w-5 h-5 mt-0.5 text-sky-400 shrink-0" />
      <div>
        <h4 class="text-sm font-medium text-sky-500 dark:text-sky-300 mb-0.5">Currency Configuration</h4>
        <p class="text-xs text-sky-600 dark:text-sky-400/80 leading-relaxed">Ensure all active plans use the same currency. Mixing different currencies for a single application can cause checkout issues.</p>
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
      <p v-if="pending" class="text-sm text-[var(--muted-foreground)]">Loading plans...</p>

      <EmptyState
        v-else-if="plans.length === 0"
        :icon="LayersIcon"
        title="No plans yet"
        description="Create a plan to start billing subscribers."
        cta-label="New plan"
        @cta="openCreatePage"
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
              <div class="mt-1 text-[var(--muted-foreground)] hidden sm:block opacity-50 hover:opacity-100 transition-opacity">
                <GripVerticalIcon class="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-lg text-[var(--foreground)]">{{ plan.name }}</span>
                  <span v-if="!plan.is_active" class="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--color-surface-muted)] text-[var(--muted-foreground)] border border-[var(--color-border-dark)]">
                    Draft
                  </span>
                  <span v-else class="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Published
                  </span>
                  <span v-if="(plan.yearly_discount_percent ?? 0) > 0" class="px-2 py-0.5 rounded text-[11px] font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                    {{ plan.yearly_discount_percent }}% annual discount
                  </span>
                </div>
                <div class="text-sm text-[var(--muted-foreground)]">
                  {{ formatCurrency(plan.price, plan.currency || 'NGN') }} / {{ plan.duration_days >= 180 ? 'year' : 'month' }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Button
                v-if="!plan.is_active"
                variant="outline"
                size="sm"
                class="h-7 text-xs font-medium cursor-pointer"
                @click.stop="togglePublish(plan)"
              >
                Publish
              </Button>
              <Button
                v-else
                variant="ghost"
                size="sm"
                class="h-7 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                @click.stop="togglePublish(plan)"
              >
                Unpublish
              </Button>
              <button
                class="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer transition-colors"
                :aria-label="`Edit ${plan.name}`"
                @click.stop="openEditPage(plan.id)"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                class="text-[var(--muted-foreground)] hover:text-red-500 cursor-pointer transition-colors"
                :aria-label="`Delete ${plan.name}`"
                @click.stop="promptDelete(plan.id)"
              >
                <Trash2Icon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Features list on plan card -->
          <div class="pt-2 border-t border-[var(--color-border-dark)]">
            <div class="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Included Features</div>
            <div v-if="!plan.features || plan.features.length === 0" class="text-xs text-[var(--muted-foreground)] italic">
              No features included in this plan
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <span
                v-for="feat in plan.features"
                :key="feat.id"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-surface-muted)] text-[var(--foreground)] border border-[var(--color-border-dark)]"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                <span>{{ feat.name }}</span>
                <span class="font-mono text-[10px] text-[var(--muted-foreground)]">({{ feat.code }})</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <Dialog :open="!!pendingDeleteId" @update:open="pendingDeleteId = null">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete plan</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this plan? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div class="flex justify-end gap-2 mt-4">
          <Button variant="ghost" class="cursor-pointer" :disabled="isDeleting" @click="pendingDeleteId = null">Cancel</Button>
          <Button
            variant="destructive"
            class="cursor-pointer"
            :disabled="isDeleting"
            @click="confirmDelete"
          >{{ isDeleting ? 'Deleting...' : 'Delete' }}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
