<!-- app/components/layout/AppSwitcherModal.vue -->
<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { PlusIcon, CheckIcon } from '@lucide/vue'
import CreateAppModal from '~/components/layout/CreateAppModal.vue'

const open = defineModel<boolean>('open', { required: true })
const { apps, selectApp } = useApps()
const search = ref('')
const showCreate = ref(false)

const filtered = computed(() =>
  apps.value.filter((a) => a.name.toLowerCase().includes(search.value.toLowerCase()))
)

function pick(slug: string) {
  open.value = false
  selectApp(slug)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <div class="flex items-center justify-between">
        <DialogHeader class="p-0">
          <DialogTitle>Select an app</DialogTitle>
        </DialogHeader>
        <Button size="sm" variant="secondary" class="cursor-pointer gap-1" @click="showCreate = true">
          <PlusIcon class="w-4 h-4" /> New app
        </Button>
      </div>
      <Input v-model="search" placeholder="Search apps" class="mt-2" />
      <div class="mt-4 space-y-1 max-h-64 overflow-y-auto">
        <button
          v-for="app in filtered"
          :key="app.id"
          class="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer text-left"
          @click="pick(app.slug)"
        >
          <span class="flex items-center gap-2">
            <CheckIcon class="w-4 h-4 text-[var(--color-accent)]" />
            <span>
              <div class="font-medium">{{ app.name }}</div>
              <div class="text-xs text-slate-400">{{ app.slug }}</div>
            </span>
          </span>
          <Badge v-if="app.status === 'active'" class="bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
            Active
          </Badge>
        </button>
      </div>
      <div class="flex justify-end mt-4">
        <Button variant="ghost" class="cursor-pointer" @click="open = false">Cancel</Button>
      </div>
    </DialogContent>
  </Dialog>
  <CreateAppModal v-model:open="showCreate" />
</template>
