<!-- app/components/layout/AppSwitcherModal.vue -->
<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { CheckIcon, SearchIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import CreateAppModal from '~/components/layout/CreateAppModal.vue'
import { toast } from 'vue-sonner'

const open = defineModel<boolean>('open', { required: true })
const { apps, selectApp } = useApps()
const search = ref('')
const showCreate = ref(false)
const route = useRoute()
const currentSlug = computed(() => route.params.slug as string)

const filtered = computed(() =>
  apps.value.filter((a) => a.name.toLowerCase().includes(search.value.toLowerCase()))
)

function pick(slug: string) {
  open.value = false
  selectApp(slug)
  toast.success('Switched application successfully')
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-[480px] p-0 gap-0 border border-[var(--color-border-dark)] bg-[var(--color-surface)] shadow-2xl rounded-xl font-sans overflow-hidden [&>button.absolute]:hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border-dark)]">
        <DialogHeader class="p-0">
          <DialogTitle class="text-xl font-heading font-semibold text-[var(--foreground)]">Select application</DialogTitle>
        </DialogHeader>
        <Button class="h-8 px-3 cursor-pointer text-xs" @click="showCreate = true">
          New app
        </Button>
      </div>

      <!-- Search -->
      <div class="p-4 border-b border-[var(--color-border-dark)]">
        <div class="relative flex items-center bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-[var(--color-accent)] transition-all">
          <SearchIcon class="w-4 h-4 text-[var(--muted-foreground)] ml-3 shrink-0" />
          <input
            v-model="search"
            type="text"
            placeholder="Search applications..."
            class="block w-full bg-transparent border-0 py-2.5 pl-2 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-0 outline-none"
          />
        </div>
      </div>

      <!-- List -->
      <div class="flex-grow overflow-y-auto max-h-[380px] min-h-[220px]">
        <div class="p-2 space-y-0.5">
          <button
            v-for="app in filtered"
            :key="app.id"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--color-hover)] transition-colors cursor-pointer text-left group"
            :class="app.slug === currentSlug ? 'bg-[var(--color-hover)]' : ''"
            @click="pick(app.slug)"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-9 h-9 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] flex items-center justify-center text-xs font-semibold shrink-0 group-hover:border-[var(--color-accent)]/30 group-hover:text-[var(--color-accent)] transition-colors">
                {{ app.name[0]?.toUpperCase() }}
              </span>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium text-[var(--foreground)] truncate">{{ app.name }}</span>
                <span class="text-xs text-[var(--muted-foreground)] truncate">{{ app.slug }}</span>
              </div>
            </div>
            <CheckIcon v-if="app.slug === currentSlug" class="w-4 h-4 text-[var(--color-accent)] shrink-0" />
          </button>

          <div v-if="filtered.length === 0" class="text-center py-12 text-sm text-[var(--muted-foreground)]">
            No applications found matching "{{ search }}"
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-[var(--color-border-dark)] flex justify-end">
        <Button variant="ghost" class="cursor-pointer" @click="open = false">Cancel</Button>
      </div>
    </DialogContent>
  </Dialog>
  <CreateAppModal v-model:open="showCreate" />
</template>
