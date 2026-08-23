<!-- app/pages/apps/[slug]/api-keys.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { KeyIcon, PlusIcon, Trash2Icon, CopyIcon, CheckIcon, ShieldAlertIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { formatDate } from '~/utils/format'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'

const { currentApp } = useApps()
const { mode } = useEnvMode()
const appId = computed(() => currentApp.value?.id ?? 0)
const { apiKeys, pending, fetchApiKeys, createApiKey, revokeApiKey } = useApiKeys(appId.value)

watchEffect(() => {
  if (appId.value) fetchApiKeys()
})

const createOpen = ref(false)
const name = ref('')
const revealedPublishableKey = ref<string | null>(null)
const revealedSecretKey = ref<string | null>(null)
const revealedFullKey = ref<string | null>(null)
const copiedPublishable = ref(false)
const copiedSecret = ref(false)
const isCreating = ref(false)
const errorMessage = ref('')

const pendingRevokeId = ref<number | null>(null)
const isRevoking = ref(false)

async function handleCreate() {
  if (!name.value.trim()) return
  isCreating.value = true
  errorMessage.value = ''
  try {
    const { publishableKey, secretKey, fullKey } = await createApiKey(name.value.trim())
    revealedPublishableKey.value = publishableKey
    revealedSecretKey.value = secretKey
    revealedFullKey.value = fullKey
    name.value = ''
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isCreating.value = false
  }
}

async function copyPublishableKey() {
  if (!revealedPublishableKey.value) return
  await navigator.clipboard.writeText(revealedPublishableKey.value)
  copiedPublishable.value = true
  setTimeout(() => { copiedPublishable.value = false }, 2000)
}

async function copySecretKey() {
  if (!revealedSecretKey.value) return
  await navigator.clipboard.writeText(revealedSecretKey.value)
  copiedSecret.value = true
  setTimeout(() => { copiedSecret.value = false }, 2000)
}

function closeDialog() {
  createOpen.value = false
  revealedPublishableKey.value = null
  revealedSecretKey.value = null
  revealedFullKey.value = null
  copiedPublishable.value = false
  copiedSecret.value = false
  errorMessage.value = ''
}

async function confirmRevoke(id: number) {
  isRevoking.value = true
  try {
    await revokeApiKey(id)
    pendingRevokeId.value = null
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isRevoking.value = false
  }
}

function lastUsedLabel(key: { last_used_at: string | null }) {
  return key.last_used_at ? `Last used ${formatDate(key.last_used_at)}` : 'Never used'
}
</script>

<template>
  <div>
    <AppHeader title="API keys" :subtitle="`${apiKeys.length} key${apiKeys.length === 1 ? '' : 's'} · authenticating in ${mode} mode`">
      <template #actions>
        <Button class="cursor-pointer gap-1" @click="createOpen = true">
          <PlusIcon class="w-4 h-4" /> New key
        </Button>
      </template>
    </AppHeader>

    <p v-if="pending" class="text-sm text-slate-400 mb-4">Loading API keys...</p>

    <EmptyState
      v-else-if="apiKeys.length === 0"
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
          <span class="w-8 h-8 rounded-md bg-[var(--color-key)]/10 flex items-center justify-center shrink-0">
            <KeyIcon class="w-4 h-4 text-[var(--color-key)]" />
          </span>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium truncate">{{ key.name }}</span>
              <span
                class="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0"
                :class="key.environment === 'live' ? 'bg-[var(--color-key)]/15 text-[var(--color-key)]' : 'bg-amber-400/15 text-amber-400'"
              >{{ key.environment }}</span>
            </div>
            <div class="text-sm text-slate-400 font-mono tracking-tight">{{ key.public_id }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4 shrink-0">
          <span class="text-xs text-slate-500 hidden sm:block">{{ lastUsedLabel(key) }}</span>
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
        <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {{ errorMessage }}
        </p>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" :disabled="isRevoking" @click="pendingRevokeId = null">Cancel</Button>
          <Button
            variant="destructive"
            class="cursor-pointer"
            :disabled="isRevoking"
            @click="pendingRevokeId && confirmRevoke(pendingRevokeId)"
          >{{ isRevoking ? 'Revoking...' : 'Revoke key' }}</Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="createOpen">
      <DialogContent>
        <template v-if="!revealedSecretKey">
          <DialogHeader>
            <DialogTitle>New API key</DialogTitle>
            <DialogDescription>Give this key a name so you can identify it later.</DialogDescription>
          </DialogHeader>
          <div class="space-y-4 py-2">
            <div class="space-y-2">
              <Label for="key-name">Key name</Label>
              <Input id="key-name" v-model="name" placeholder="Production server" />
            </div>
            <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
              {{ errorMessage }}
            </p>
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="ghost" class="cursor-pointer" :disabled="isCreating" @click="closeDialog">Cancel</Button>
            <Button class="cursor-pointer" :disabled="!name.trim() || isCreating" @click="handleCreate">
              {{ isCreating ? 'Creating...' : 'Create key' }}
            </Button>
          </div>
        </template>
        <template v-else>
          <DialogHeader>
            <DialogTitle>Key created</DialogTitle>
            <DialogDescription>Copy these now — the secret won't be shown again.</DialogDescription>
          </DialogHeader>
          <div class="py-2 space-y-3">
            <div class="space-y-1.5">
              <Label>Publishable key</Label>
              <div class="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)]">
                <code class="text-sm font-mono flex-1 break-all select-all">{{ revealedPublishableKey }}</code>
                <button class="text-slate-400 hover:text-white cursor-pointer shrink-0" aria-label="Copy publishable key" @click="copyPublishableKey">
                  <component :is="copiedPublishable ? CheckIcon : CopyIcon" class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="space-y-1.5">
              <Label>Secret key</Label>
              <div class="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-surface-muted)] border border-amber-400/30">
                <code class="text-sm font-mono flex-1 break-all select-all">{{ revealedSecretKey }}</code>
                <button class="text-slate-400 hover:text-white cursor-pointer shrink-0" aria-label="Copy secret key" @click="copySecretKey">
                  <component :is="copiedSecret ? CheckIcon : CopyIcon" class="w-4 h-4" />
                </button>
              </div>
              <p class="flex items-center gap-1.5 text-xs text-amber-400">
                <ShieldAlertIcon class="w-3.5 h-3.5 shrink-0" />
                This secret won't be shown again — copy it now.
              </p>
            </div>
            <p class="text-xs text-slate-500">
              Requests authenticate with the two joined by a dot: <code class="font-mono">{{ revealedFullKey }}</code>
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
