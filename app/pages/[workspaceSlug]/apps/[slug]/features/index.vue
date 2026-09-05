<!-- app/pages/apps/[slug]/features/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { PuzzleIcon, PlusIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'
import { toast } from 'vue-sonner'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)
const { features, pending, fetchFeatures, deleteFeature } = useFeatures(appId.value)
const { t } = useI18n()

watchEffect(() => {
  if (appId.value) fetchFeatures()
})

const errorMessage = ref('')
const route = useRoute()

const subtitle = computed(() =>
  features.value.length === 1
    ? t('features.subtitleOne', { count: features.value.length })
    : t('features.subtitleOther', { count: features.value.length })
)

function openCreatePage() {
  navigateTo(`/${route.params.workspaceSlug}/apps/${route.params.slug}/features/new`)
}

function openEditPage(featureId: number) {
  navigateTo(`/${route.params.workspaceSlug}/apps/${route.params.slug}/features/${featureId}`)
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
    await deleteFeature(pendingDeleteId.value)
    toast.success(t('features.toasts.deleted'))
    pendingDeleteId.value = null
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div>
    <AppHeader :title="$t('nav.features')" :subtitle="subtitle">
      <template #actions>
        <Button class="cursor-pointer gap-1" @click="openCreatePage">
          <PlusIcon class="w-4 h-4" /> {{ $t('features.newFeature') }}
        </Button>
      </template>
    </AppHeader>

    <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <p v-if="pending" class="text-sm text-[var(--muted-foreground)]">{{ $t('features.loading') }}</p>

    <EmptyState
      v-else-if="features.length === 0"
      :icon="PuzzleIcon"
      :title="$t('features.emptyTitle')"
      :description="$t('features.emptyDescription')"
      :cta-label="$t('features.newFeature')"
      @cta="openCreatePage"
    />

    <div v-else class="space-y-3">
      <div
        v-for="feature in features"
        :key="feature.id"
        class="flex items-start justify-between p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-dark)]"
      >
        <div class="space-y-1">
          <div class="font-medium text-[var(--foreground)]">{{ feature.name }}</div>
          <div class="flex items-center gap-2">
            <span class="inline-block px-2 py-0.5 rounded text-xs font-mono bg-[var(--color-surface-muted)] text-teal-400 border border-[var(--color-border-dark)]">
              {{ feature.code }}
            </span>
          </div>
          <p class="text-sm text-[var(--muted-foreground)]">{{ feature.description }}</p>
        </div>
        <div class="flex items-center gap-3 pt-1">
          <button
            class="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer transition-colors"
            :aria-label="$t('features.editAria', { name: feature.name || feature.code })"
            @click="openEditPage(feature.id)"
          >
            <PencilIcon class="w-4 h-4" />
          </button>
          <button
            class="text-[var(--muted-foreground)] hover:text-red-500 cursor-pointer transition-colors"
            :aria-label="$t('features.deleteAria', { name: feature.name || feature.code })"
            @click="promptDelete(feature.id)"
          >
            <Trash2Icon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <Dialog :open="!!pendingDeleteId" @update:open="pendingDeleteId = null">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ $t('features.deleteDialog.title') }}</DialogTitle>
          <DialogDescription>
            {{ $t('features.deleteDialog.description') }}
          </DialogDescription>
        </DialogHeader>
        <div class="flex justify-end gap-2 mt-4">
          <Button variant="ghost" class="cursor-pointer" :disabled="isDeleting" @click="pendingDeleteId = null">{{ $t('common.cancel') }}</Button>
          <Button
            variant="destructive"
            class="cursor-pointer"
            :disabled="isDeleting"
            @click="confirmDelete"
          >{{ isDeleting ? $t('features.deleteDialog.deleting') : $t('features.deleteDialog.confirm') }}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
