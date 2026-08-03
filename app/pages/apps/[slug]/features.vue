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
const appId = computed(() => currentApp.value?.id ?? '')
const { features, createFeature, deleteFeature } = useFeatures(appId.value)

const createOpen = ref(false)
const key = ref('')
const description = ref('')

function slugifyKey(v: string) {
  return v.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

function handleCreate() {
  const cleanKey = slugifyKey(key.value)
  if (!cleanKey) return
  createFeature({ key: cleanKey, description: description.value.trim() })
  key.value = ''
  description.value = ''
  createOpen.value = false
}
</script>

<template>
  <div>
    <TheSubTabs />
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm text-slate-400">{{ features.length }} feature{{ features.length === 1 ? '' : 's' }}</span>
      <Button class="cursor-pointer gap-1" @click="createOpen = true">
        <PlusIcon class="w-4 h-4" /> New feature
      </Button>
    </div>

    <EmptyState
      v-if="features.length === 0"
      :icon="PuzzleIcon"
      title="No features yet"
      description="Define a feature flag to gate functionality per plan."
      cta-label="New feature"
      @cta="createOpen = true"
    />

    <div v-else class="space-y-3">
      <div
        v-for="feature in features"
        :key="feature.id"
        class="flex items-center justify-between p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-dark)]"
      >
        <div>
          <div class="font-mono text-sm font-medium">{{ feature.key }}</div>
          <div class="text-sm text-slate-400">{{ feature.description }}</div>
        </div>
        <div class="flex items-center gap-3">
          <PencilIcon class="w-4 h-4 text-slate-400 cursor-pointer" :aria-label="`Edit ${feature.key}`" />
          <button class="text-slate-400 hover:text-red-400 cursor-pointer" :aria-label="`Delete ${feature.key}`" @click="deleteFeature(feature.id)">
            <Trash2Icon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <Dialog v-model:open="createOpen">
      <DialogContent>
        <DialogHeader><DialogTitle>New feature</DialogTitle></DialogHeader>
        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label for="feature-key">Key</Label>
            <Input id="feature-key" v-model="key" placeholder="auth_multiple" />
            <p class="text-xs text-slate-500">snake_case, auto-formatted on save</p>
          </div>
          <div class="space-y-2">
            <Label for="feature-desc">Description</Label>
            <Input id="feature-desc" v-model="description" placeholder="What this feature means for the user" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" @click="createOpen = false">Cancel</Button>
          <Button class="cursor-pointer" :disabled="!key.trim()" @click="handleCreate">Create feature</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
