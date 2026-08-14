<!-- app/pages/apps/[slug]/settings.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { WebhookIcon, TrashIcon } from '@lucide/vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import AppHeader from '~/components/dashboard/AppHeader.vue'

const { currentApp, updateApp, deleteApp } = useApps()
const route = useRoute()

const appName = ref(currentApp.value?.name ?? '')
const webhookUrl = ref(currentApp.value?.webhook_url ?? '')
const isSaving = ref(false)
const errorMessage = ref('')

const deleteOpen = ref(false)
const isDeleting = ref(false)
const deleteError = ref('')

// Update refs if currentApp changes
watch(currentApp, (newApp) => {
  if (newApp) {
    appName.value = newApp.name
    webhookUrl.value = newApp.webhook_url ?? ''
  }
})

async function saveSettings() {
  if (!currentApp.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await updateApp(currentApp.value.id, { 
      name: appName.value,
      webhook_url: webhookUrl.value || null 
    })
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isSaving.value = false
  }
}

async function confirmDelete() {
  if (!currentApp.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await deleteApp(currentApp.value.id)
    await navigateTo(`/${route.params.workspaceSlug}/dashboard`)
  } catch (e) {
    deleteError.value = extractApiErrorMessage(e)
    isDeleting.value = false
  }
}
</script>

<template>
  <div v-if="currentApp">
    <AppHeader title="App settings" subtitle="Manage your application settings and configurations" />
    
    <div class="max-w-3xl pb-12 space-y-6 mt-4">
      <!-- General Settings Card -->
      <div class="bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-[var(--color-border-dark)]">
           <h3 class="font-semibold text-[var(--foreground)]">General Configuration</h3>
        </div>
        <div class="p-6 space-y-6">
          <div class="space-y-2 max-w-md">
            <Label for="app-name">App Name</Label>
            <Input id="app-name" v-model="appName" placeholder="Your amazing app" />
          </div>

          <div class="pt-6 border-t border-[var(--color-border-dark)] max-w-xl">
            <div class="flex items-center gap-2 mb-1">
              <WebhookIcon class="w-4 h-4 text-[var(--muted-foreground)]" />
              <h3 class="font-medium text-sm text-[var(--foreground)]">Webhook endpoint</h3>
            </div>
            <p class="text-xs text-[var(--muted-foreground)] mb-3">We'll POST subscription events to this URL.</p>
            <div class="space-y-2">
              <Label for="webhook-url">Endpoint URL</Label>
              <Input id="webhook-url" v-model="webhookUrl" placeholder="https://yourapp.com/webhooks/klea" class="font-mono text-sm" />
            </div>
          </div>

          <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {{ errorMessage }}
          </p>
        </div>
        <div class="px-6 py-4 bg-[var(--color-surface-muted)] border-t border-[var(--color-border-dark)] flex justify-end">
          <Button class="cursor-pointer" :disabled="isSaving" @click="saveSettings">
            {{ isSaving ? 'Saving...' : 'Save changes' }}
          </Button>
        </div>
      </div>

      <!-- Danger Zone Card -->
      <div class="bg-red-500/5 border border-red-500/20 rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-red-500/20 flex items-center gap-2">
           <TrashIcon class="w-4 h-4 text-red-500" />
           <h3 class="font-semibold text-red-500">Danger Zone</h3>
        </div>
        <div class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-medium text-[var(--foreground)] mb-1">Delete Application</h4>
            <p class="text-sm text-[var(--muted-foreground)]">
              Permanently remove this app and all of its data. This cannot be undone.
            </p>
          </div>
          <Button variant="destructive" class="cursor-pointer gap-1.5 shrink-0" @click="deleteOpen = true">
            Delete {{ currentApp.name }}
          </Button>
        </div>
      </div>
    </div>

    <Dialog v-model:open="deleteOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {{ currentApp.name }}?</DialogTitle>
          <DialogDescription>
            This permanently deletes the app, its plans, features, subscribers, and API keys. This can't be undone.
          </DialogDescription>
        </DialogHeader>
        <p v-if="deleteError" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {{ deleteError }}
        </p>
        <div class="flex justify-end gap-2 mt-4">
          <Button variant="ghost" class="cursor-pointer" :disabled="isDeleting" @click="deleteOpen = false">Cancel</Button>
          <Button variant="destructive" class="cursor-pointer" :disabled="isDeleting" @click="confirmDelete">
            {{ isDeleting ? 'Deleting...' : 'Delete app' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
