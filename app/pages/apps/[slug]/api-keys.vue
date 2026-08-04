<!-- app/pages/apps/[slug]/api-keys.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { KeyIcon, PlusIcon, Trash2Icon, CopyIcon, CheckIcon, ShieldAlertIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { formatDate } from '~/utils/format'
import TheSubTabs from '~/components/layout/TheSubTabs.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'

const { currentApp } = useApps()
const { mode } = useEnvMode()
const appId = computed(() => currentApp.value?.id ?? '')
const { apiKeys, createApiKey, revokeApiKey } = useApiKeys(appId.value)

const createOpen = ref(false)
const name = ref('')
const revealedKey = ref<string | null>(null)
const copied = ref(false)
const pendingRevokeId = ref<string | null>(null)

function handleCreate() {
  if (!name.value.trim()) return
  const { fullKey } = createApiKey(name.value.trim())
  revealedKey.value = fullKey
  name.value = ''
}

async function copyKey() {
  if (!revealedKey.value) return
  await navigator.clipboard.writeText(revealedKey.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function closeDialog() {
  createOpen.value = false
  revealedKey.value = null
  copied.value = false
}

function confirmRevoke(id: string) {
  revokeApiKey(id)
  pendingRevokeId.value = null
}
</script>

<template>
  <div>
    <TheSubTabs />
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="font-heading text-xl font-semibold">API keys</h1>
        <p class="text-sm text-slate-400 mt-0.5">
          {{ apiKeys.length }} key{{ apiKeys.length === 1 ? '' : 's' }} · authenticating in
          <span :class="mode === 'live' ? 'text-[var(--color-accent)]' : 'text-amber-400'">{{ mode }}</span> mode
        </p>
      </div>
      <Button class="cursor-pointer gap-1" @click="createOpen = true">
        <PlusIcon class="w-4 h-4" /> New key
      </Button>
    </div>

    <EmptyState
      v-if="apiKeys.length === 0"
      :icon="KeyIcon"
      title="No API keys yet"
      description="Generate a key to start authenticating requests."
      cta-label="New key"
      @cta="createOpen = true"
    />

    <div v-else class="rounded-lg border border-[var(--color-border-dark)] divide-y divide-[var(--color-border-dark)] overflow-hidden">
      <div
        v-for="key in apiKeys"
        :key="key.id"
        class="flex items-center justify-between gap-4 px-4 py-3.5 bg-[var(--color-surface)] hover:bg-white/[0.02] transition-colors duration-150"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-8 h-8 rounded-md bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
            <KeyIcon class="w-4 h-4 text-[var(--color-accent)]" />
          </span>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium truncate">{{ key.name }}</span>
              <span
                class="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0"
                :class="key.env === 'live' ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'bg-amber-400/15 text-amber-400'"
              >{{ key.env }}</span>
            </div>
            <div class="text-sm text-slate-400 font-mono tracking-tight">{{ key.maskedKey }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4 shrink-0">
          <span class="text-xs text-slate-500 hidden sm:block">Created {{ formatDate(key.createdAt) }}</span>
          <button
            class="text-slate-500 hover:text-red-400 cursor-pointer transition-colors duration-150"
            :aria-label="`Revoke ${key.name}`"
            @click="pendingRevokeId = key.id"
          >
            <Trash2Icon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <Dialog :open="!!pendingRevokeId" @update:open="pendingRevokeId = null">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke key</DialogTitle>
          <DialogDescription>
            Any request using this key will stop working immediately. This can't be undone.
          </DialogDescription>
        </DialogHeader>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" @click="pendingRevokeId = null">Cancel</Button>
          <Button
            variant="destructive"
            class="cursor-pointer"
            @click="pendingRevokeId && confirmRevoke(pendingRevokeId)"
          >Revoke key</Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="createOpen">
      <DialogContent>
        <template v-if="!revealedKey">
          <DialogHeader>
            <DialogTitle>New API key</DialogTitle>
            <DialogDescription>Give this key a name so you can identify it later.</DialogDescription>
          </DialogHeader>
          <div class="space-y-4 py-2">
            <div class="space-y-2">
              <Label for="key-name">Key name</Label>
              <Input id="key-name" v-model="name" placeholder="Production server" />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="ghost" class="cursor-pointer" @click="closeDialog">Cancel</Button>
            <Button class="cursor-pointer" :disabled="!name.trim()" @click="handleCreate">Create key</Button>
          </div>
        </template>
        <template v-else>
          <DialogHeader>
            <DialogTitle>Key created</DialogTitle>
            <DialogDescription>Copy this key now — you won't be able to see it again.</DialogDescription>
          </DialogHeader>
          <div class="py-2">
            <div class="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-surface-muted)] border border-amber-400/30">
              <code class="text-sm font-mono flex-1 break-all select-all">{{ revealedKey }}</code>
              <button class="text-slate-400 hover:text-white cursor-pointer shrink-0" aria-label="Copy key" @click="copyKey">
                <component :is="copied ? CheckIcon : CopyIcon" class="w-4 h-4" />
              </button>
            </div>
            <p class="flex items-center gap-1.5 text-xs text-amber-400 mt-3">
              <ShieldAlertIcon class="w-3.5 h-3.5 shrink-0" />
              This key won't be shown again — copy it now.
            </p>
          </div>
          <div class="flex justify-end">
            <Button class="cursor-pointer" @click="closeDialog">Done</Button>
          </div>
        </template>
      </DialogContent>
    </Dialog>
  </div>
</template>
