<!-- app/pages/apps/[slug]/features.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { PuzzleIcon, PlusIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import TheSubTabs from '~/components/layout/TheSubTabs.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)
const { features, pending, fetchFeatures, createFeature, updateFeature, deleteFeature } = useFeatures(appId.value)

watchEffect(() => {
  if (appId.value) fetchFeatures()
})

const dialogOpen = ref(false)
const editingFeatureId = ref<number | null>(null)
const name = ref('')
const key = ref('')
const description = ref('')
const isSaving = ref(false)
const errorMessage = ref('')

function slugifyKey(v: string) {
  return v.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

function openCreateModal() {
  editingFeatureId.value = null
  name.value = ''
  key.value = ''
  description.value = ''
  errorMessage.value = ''
  dialogOpen.value = true
}

function openEditModal(feature: import('~/composables/useFeatures').Feature) {
  editingFeatureId.value = feature.id
  name.value = feature.name || ''
  key.value = feature.code || ''
  description.value = feature.description || ''
  errorMessage.value = ''
  dialogOpen.value = true
}

async function handleSave() {
  const cleanKey = slugifyKey(key.value)
  if (!cleanKey) return
  const featureName = name.value.trim() || cleanKey

  isSaving.value = true
  errorMessage.value = ''
  try {
    if (editingFeatureId.value) {
      await updateFeature(editingFeatureId.value, {
        name: featureName,
        code: cleanKey,
        description: description.value.trim(),
      })
    } else {
      await createFeature({
        name: featureName,
        code: cleanKey,
        description: description.value.trim(),
      })
    }
    dialogOpen.value = false
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isSaving.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await deleteFeature(id)
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  }
}
</script>

<template>
  <div>
    <TheSubTabs />
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm text-slate-400">{{ features.length }} feature{{ features.length === 1 ? '' : 's' }}</span>
      <Button class="cursor-pointer gap-1" @click="openCreateModal">
        <PlusIcon class="w-4 h-4" /> New feature
      </Button>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <p v-if="pending" class="text-sm text-slate-400">Loading features...</p>

    <EmptyState
      v-else-if="features.length === 0"
      :icon="PuzzleIcon"
      title="No features yet"
      description="Define a feature flag to gate functionality per plan."
      cta-label="New feature"
      @cta="openCreateModal"
    />

    <div v-else class="space-y-3">
      <div
        v-for="feature in features"
        :key="feature.id"
        class="flex items-start justify-between p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-dark)]"
      >
        <div class="space-y-1">
          <div class="font-medium text-slate-100">{{ feature.name }}</div>
          <div class="flex items-center gap-2">
            <span class="inline-block px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-teal-400 border border-slate-700/60">
              {{ feature.code }}
            </span>
          </div>
          <p class="text-sm text-slate-400">{{ feature.description }}</p>
        </div>
        <div class="flex items-center gap-3 pt-1">
          <button
            class="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            :aria-label="`Edit ${feature.name || feature.code}`"
            @click="openEditModal(feature)"
          >
            <PencilIcon class="w-4 h-4" />
          </button>
          <button
            class="text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
            :aria-label="`Delete ${feature.name || feature.code}`"
            @click="handleDelete(feature.id)"
          >
            <Trash2Icon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editingFeatureId ? 'Edit feature' : 'New feature' }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label for="feature-name">Feature Name</Label>
            <Input id="feature-name" v-model="name" placeholder="Multiple Device Login" />
          </div>
          <div class="space-y-2">
            <Label for="feature-key">Code / Key</Label>
            <Input id="feature-key" v-model="key" placeholder="auth_multiple" />
            <p class="text-xs text-slate-500">snake_case, auto-formatted on save</p>
          </div>
          <div class="space-y-2">
            <Label for="feature-desc">Description</Label>
            <Input id="feature-desc" v-model="description" placeholder="What this feature means for the user" />
          </div>
          <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {{ errorMessage }}
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" @click="dialogOpen = false">Cancel</Button>
          <Button class="cursor-pointer" :disabled="!key.trim() || isSaving" @click="handleSave">
            {{ isSaving ? 'Saving...' : editingFeatureId ? 'Save changes' : 'Create feature' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
