<!-- app/components/layout/CreateAppModal.vue -->
<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { toast } from 'vue-sonner'

const open = defineModel<boolean>('open', { required: true })
const { createApp, selectApp } = useApps()
const { markCreateAppStepDone } = useTour()

const name = ref('')
const slug = computed(() =>
  name.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleCreate() {
  if (!name.value.trim()) return
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    const app = await createApp(name.value.trim(), slug.value)
    name.value = ''
    open.value = false
    markCreateAppStepDone()
    selectApp(app.slug)
    toast.success('Application created successfully')
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create application</DialogTitle>
        <DialogDescription>Register a new app to manage its plans, keys, and licenses.</DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-2">
        <div class="space-y-2">
          <Label for="app-name">Application name</Label>
          <Input id="app-name" v-model="name" placeholder="My SaaS App" />
        </div>
        <div class="space-y-2">
          <Label for="app-slug">Slug</Label>
          <Input id="app-slug" :model-value="slug" disabled />
        </div>
        <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {{ errorMessage }}
        </p>
      </div>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" class="cursor-pointer" @click="open = false">Cancel</Button>
        <Button class="cursor-pointer" :disabled="!name.trim() || isSubmitting" @click="handleCreate">
          {{ isSubmitting ? 'Creating...' : 'Create app' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
