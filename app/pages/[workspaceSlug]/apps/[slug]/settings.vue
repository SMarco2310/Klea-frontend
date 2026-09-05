<!-- app/pages/apps/[slug]/settings.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { WebhookIcon, TrashIcon, EyeIcon, EyeOffIcon, CopyIcon, CheckIcon, RefreshCwIcon } from '@lucide/vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import AppHeader from '~/components/dashboard/AppHeader.vue'
import { toast } from 'vue-sonner'
import type { App } from '~/composables/useApps'

const { currentApp, updateApp, deleteApp } = useApps()
const route = useRoute()
const { t } = useI18n()

const appName = ref(currentApp.value?.name ?? '')
const webhookUrl = ref(currentApp.value?.webhook_url ?? '')
const redirectUrl = ref(currentApp.value?.redirect_url ?? '')
const isSaving = ref(false)
const errorMessage = ref('')

const webhookSecret = computed(() => currentApp.value?.webhook_secret ?? null)
const secretVisible = ref(false)
const copiedSecret = ref(false)
const regenerateOpen = ref(false)
const isRegenerating = ref(false)

const maskedSecret = computed(() =>
  webhookSecret.value ? `${webhookSecret.value.slice(0, 6)}${'•'.repeat(24)}` : null
)

/**
 * The signing secret is shared with the receiving app, so it has to be
 * unguessable — 32 random bytes from the platform CSPRNG, hex encoded.
 */
function generateSecret(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function copySecret() {
  if (!webhookSecret.value) return
  await navigator.clipboard.writeText(webhookSecret.value)
  copiedSecret.value = true
  toast.success(t('apps.settings.toasts.secretCopied'))
  setTimeout(() => { copiedSecret.value = false }, 2000)
}

async function confirmRegenerate() {
  if (!currentApp.value) return
  isRegenerating.value = true
  errorMessage.value = ''
  try {
    await updateApp(currentApp.value.id, { webhook_secret: generateSecret() })
    secretVisible.value = true
    regenerateOpen.value = false
    toast.success(t('apps.settings.toasts.secretRegenerated'))
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isRegenerating.value = false
  }
}

const deleteOpen = ref(false)
const isDeleting = ref(false)
const deleteError = ref('')
const deleteConfirmText = ref('')

watch(deleteOpen, (isOpen) => {
  if (!isOpen) {
    deleteConfirmText.value = ''
    deleteError.value = ''
  }
})

// Update refs if currentApp changes
watch(currentApp, (newApp) => {
  if (newApp) {
    appName.value = newApp.name
    webhookUrl.value = newApp.webhook_url ?? ''
    redirectUrl.value = newApp.redirect_url ?? ''
  }
})

async function saveSettings() {
  if (!currentApp.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    const patch: Partial<Pick<App, 'name' | 'webhook_url' | 'webhook_secret' | 'redirect_url'>> = {
      name: appName.value,
      webhook_url: webhookUrl.value || null,
      redirect_url: redirectUrl.value || null,
    }

    // An endpoint is useless without a secret to sign deliveries with, so the
    // first time one is set we mint the secret alongside it. Never overwrite an
    // existing secret here — that would silently break a live integration.
    const mintedSecret = Boolean(webhookUrl.value) && !currentApp.value.webhook_secret
    if (mintedSecret) {
      patch.webhook_secret = generateSecret()
    }

    await updateApp(currentApp.value.id, patch)

    if (mintedSecret) {
      secretVisible.value = true
      toast.success(t('apps.settings.toasts.savedWithSecret'))
    } else {
      toast.success(t('apps.settings.toasts.saved'))
    }
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
    const deletedName = currentApp.value.name
    await deleteApp(currentApp.value.id)
    toast.success(t('apps.settings.toasts.appDeleted', { name: deletedName }))
    await navigateTo(`/${route.params.workspaceSlug}/dashboard`)
  } catch (e) {
    deleteError.value = extractApiErrorMessage(e)
    isDeleting.value = false
  }
}
</script>

<template>
  <div v-if="currentApp">
    <AppHeader :title="$t('apps.settings.title')" :subtitle="$t('apps.settings.subtitle')" />
    
    <div class="max-w-3xl pb-12 space-y-6 mt-4">
      <!-- General Settings Card -->
      <div class="bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-[var(--color-border-dark)]">
           <h3 class="font-semibold text-[var(--foreground)]">{{ $t('apps.settings.generalConfig') }}</h3>
        </div>
        <div class="p-6 space-y-6">
          <div class="space-y-2 max-w-md">
            <Label for="app-name">{{ $t('apps.settings.appNameLabel') }}</Label>
            <Input id="app-name" v-model="appName" :placeholder="$t('apps.settings.appNamePlaceholder')" />
          </div>

          <div class="pt-6 border-t border-[var(--color-border-dark)] max-w-xl">
            <div class="flex items-center gap-2 mb-1">
              <WebhookIcon class="w-4 h-4 text-[var(--muted-foreground)]" />
              <h3 class="font-medium text-sm text-[var(--foreground)]">{{ $t('apps.settings.webhookSectionTitle') }}</h3>
            </div>
            <p class="text-xs text-[var(--muted-foreground)] mb-3">{{ $t('apps.settings.webhookSectionDescription') }}</p>
            <div class="space-y-2">
              <Label for="webhook-url">{{ $t('apps.settings.endpointUrlLabel') }}</Label>
              <Input id="webhook-url" v-model="webhookUrl" :placeholder="$t('apps.settings.endpointUrlPlaceholder')" class="font-mono text-sm" />
            </div>

            <!-- Different from the webhook above: this is where the customer's
                 BROWSER returns after paying, not where we POST the result. -->
            <div class="space-y-2 mt-4">
              <Label for="redirect-url">{{ $t('apps.settings.returnUrlLabel') }}</Label>
              <Input id="redirect-url" v-model="redirectUrl" :placeholder="$t('apps.settings.returnUrlPlaceholder')" class="font-mono text-sm" />
              <p class="text-xs text-[var(--muted-foreground)]">
                {{ $t('apps.settings.returnUrlHelper') }}
              </p>
            </div>

            <div class="space-y-2 mt-4">
              <Label>{{ $t('apps.settings.signingSecretLabel') }}</Label>

              <div v-if="webhookSecret" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)]">
                <code class="text-xs font-mono flex-1 truncate">{{ secretVisible ? webhookSecret : maskedSecret }}</code>
                <button
                  type="button"
                  class="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer shrink-0"
                  :aria-label="secretVisible ? $t('apps.settings.hideSecretAria') : $t('apps.settings.showSecretAria')"
                  @click="secretVisible = !secretVisible"
                >
                  <component :is="secretVisible ? EyeOffIcon : EyeIcon" class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  class="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer shrink-0"
                  :aria-label="$t('apps.settings.copySecretAria')"
                  @click="copySecret"
                >
                  <component :is="copiedSecret ? CheckIcon : CopyIcon" class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  class="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer shrink-0"
                  :aria-label="$t('apps.settings.regenerateSecretAria')"
                  @click="regenerateOpen = true"
                >
                  <RefreshCwIcon class="w-3.5 h-3.5" />
                </button>
              </div>

              <p v-else class="text-xs text-[var(--muted-foreground)]">
                {{ $t('apps.settings.secretAutoGenerated') }}
              </p>

              <p class="text-xs text-[var(--muted-foreground)]">
                {{ $t('apps.settings.secretUsageHint') }}
              </p>
            </div>
          </div>

          <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {{ errorMessage }}
          </p>
        </div>
        <div class="px-6 py-4 bg-[var(--color-surface-muted)] border-t border-[var(--color-border-dark)] flex justify-end">
          <Button class="cursor-pointer" :disabled="isSaving" @click="saveSettings">
            {{ isSaving ? $t('apps.settings.saving') : $t('apps.settings.saveChanges') }}
          </Button>
        </div>
      </div>

      <!-- Danger Zone Card -->
      <div class="bg-red-500/5 border border-red-500/20 rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-red-500/20 flex items-center gap-2">
           <TrashIcon class="w-4 h-4 text-red-500" />
           <h3 class="font-semibold text-red-500">{{ $t('apps.settings.dangerZoneTitle') }}</h3>
        </div>
        <div class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-medium text-[var(--foreground)] mb-1">{{ $t('apps.settings.deleteAppTitle') }}</h4>
            <p class="text-sm text-[var(--muted-foreground)]">
              {{ $t('apps.settings.deleteAppDescription') }}
            </p>
          </div>
          <Button variant="destructive" class="cursor-pointer gap-1.5 shrink-0" @click="deleteOpen = true">
            {{ $t('apps.settings.deleteButton', { name: currentApp.name }) }}
          </Button>
        </div>
      </div>
    </div>

    <Dialog v-model:open="regenerateOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ $t('apps.settings.regenerateDialog.title') }}</DialogTitle>
          <DialogDescription>
            {{ $t('apps.settings.regenerateDialog.description') }}
          </DialogDescription>
        </DialogHeader>

        <div class="flex justify-end gap-2 mt-4">
          <Button variant="ghost" class="cursor-pointer" :disabled="isRegenerating" @click="regenerateOpen = false">{{ $t('common.cancel') }}</Button>
          <Button variant="destructive" class="cursor-pointer" :disabled="isRegenerating" @click="confirmRegenerate">
            {{ isRegenerating ? $t('apps.settings.regenerateDialog.regenerating') : $t('apps.settings.regenerateDialog.confirm') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="deleteOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ $t('apps.settings.deleteDialog.title', { name: currentApp.name }) }}</DialogTitle>
          <DialogDescription>
            {{ $t('apps.settings.deleteDialog.description') }}
          </DialogDescription>
        </DialogHeader>

        <div class="py-2 space-y-2">
          <Label for="confirm-delete" class="text-sm font-normal text-[var(--muted-foreground)]">
            <i18n-t keypath="apps.settings.deleteDialog.confirmPrompt" tag="span">
              <template #name><strong class="text-[var(--foreground)] font-semibold select-all">{{ currentApp.name }}</strong></template>
            </i18n-t>
          </Label>
          <Input
            id="confirm-delete"
            v-model="deleteConfirmText"
            :placeholder="currentApp.name"
          />
        </div>

        <p v-if="deleteError" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {{ deleteError }}
        </p>
        <div class="flex justify-end gap-2 mt-4">
          <Button variant="ghost" class="cursor-pointer" :disabled="isDeleting" @click="deleteOpen = false">{{ $t('common.cancel') }}</Button>
          <Button
            variant="destructive"
            class="cursor-pointer"
            :disabled="isDeleting || deleteConfirmText !== currentApp.name"
            @click="confirmDelete"
          >
            {{ isDeleting ? $t('apps.settings.deleteDialog.deleting') : $t('apps.settings.deleteDialog.confirm') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
