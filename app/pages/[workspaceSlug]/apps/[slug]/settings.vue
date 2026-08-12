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
    <AppHeader title="App settings" subtitle="General configuration and danger zone" />
    <div class="max-w-xl">

      <div class="space-y-6 mb-4">
        <!-- General Settings -->
        <div class="space-y-2">
          <Label for="app-name">App Name</Label>
          <Input id="app-name" v-model="appName" placeholder="Your amazing app" />
        </div>

        <!-- Webhook Settings -->
        <div>
          <div class="flex items-center gap-2 mb-1">
            <WebhookIcon class="w-4 h-4 text-slate-400" />
            <h3 class="font-medium">Webhook endpoint</h3>
          </div>
          <p class="text-sm text-slate-400 mb-4">We'll POST subscription events to this URL.</p>
          <div class="space-y-2">
            <Label for="webhook-url">Endpoint URL</Label>
            <Input id="webhook-url" v-model="webhookUrl" placeholder="https://yourapp.com/webhooks/klea" />
          </div>
        </div>
      </div>
      <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
        {{ errorMessage }}
      </p>
      <Button class="cursor-pointer" :disabled="isSaving" @click="saveSettings">
        {{ isSaving ? 'Saving...' : 'Save changes' }}
      </Button>

      <div class="mt-10 pt-6 border-t border-[var(--color-border-dark)]">
        <h3 class="font-medium text-red-400 mb-1">Danger zone</h3>
        <p class="text-sm text-slate-400 mb-4">Deleting an app removes it and its data permanently. This can't be undone.</p>
        <Button variant="destructive" class="cursor-pointer gap-1.5" @click="deleteOpen = true">
          <TrashIcon class="w-4 h-4" /> Delete app
        </Button>
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
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" :disabled="isDeleting" @click="deleteOpen = false">Cancel</Button>
          <Button variant="destructive" class="cursor-pointer" :disabled="isDeleting" @click="confirmDelete">
            {{ isDeleting ? 'Deleting...' : 'Delete app' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
