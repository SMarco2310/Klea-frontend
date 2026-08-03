<!-- app/components/layout/CreateAppModal.vue -->
<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const open = defineModel<boolean>('open', { required: true })
const { createApp, selectApp } = useApps()

const name = ref('')
const slug = computed(() =>
  name.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
)

function handleCreate() {
  if (!name.value.trim()) return
  const app = createApp(name.value.trim(), slug.value)
  name.value = ''
  open.value = false
  selectApp(app.slug)
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
      </div>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" class="cursor-pointer" @click="open = false">Cancel</Button>
        <Button class="cursor-pointer" :disabled="!name.trim()" @click="handleCreate">Create app</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
