<!-- app/pages/settings.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { Building2Icon, CreditCardIcon, SaveIcon, EyeIcon, EyeOffIcon } from '@lucide/vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import SettingsSection from '~/components/dashboard/SettingsSection.vue'
import SettingsIdentityCard from '~/components/dashboard/SettingsIdentityCard.vue'

const { workspace, isOwner, pending, updateSettings, deleteWorkspace } = useWorkspace()
const { apps } = useApps()
const { fetchCurrentUser } = useAppAuth()

const name = ref('')
const slug = ref('')
const currency = ref('XOF')
const semoaApiKey = ref('')
const semoaMerchantId = ref('')
const showApiKey = ref(false)
const isSaving = ref(false)
const saved = ref(false)
const errorMessage = ref('')

const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')
const isDeleting = ref(false)

async function handleDelete() {
  if (deleteConfirmText.value !== workspace.value.name) return
  isDeleting.value = true
  errorMessage.value = ''
  try {
    await deleteWorkspace()
    await fetchCurrentUser() // Refresh user data to remove deleted tenant
    navigateTo('/') // Redirect to root/dashboard to pick new tenant
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
    isDeleting.value = false
  }
}

watch(workspace, (w) => {
  name.value = w.name
  slug.value = w.slug
  currency.value = w.currency
  semoaApiKey.value = w.semoaApiKey
  semoaMerchantId.value = w.semoaMerchantId
}, { immediate: true })

async function handleSave() {
  isSaving.value = true
  errorMessage.value = ''
  try {
    await updateSettings({
      name: name.value,
      slug: slug.value,
      currency: currency.value,
      semoaApiKey: semoaApiKey.value,
      semoaMerchantId: semoaMerchantId.value,
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isSaving.value = false
  }
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]',
  inactive: 'bg-slate-700/40 text-slate-400',
  suspended: 'bg-red-500/15 text-red-400',
}
</script>

<template>
  <div>
    <h1 class="font-heading text-2xl font-semibold mb-8">Settings</h1>

    <p v-if="pending" class="text-sm text-slate-400 mb-4">Loading workspace...</p>

    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      <SettingsIdentityCard
        :initial="workspace.name?.[0]?.toUpperCase() || '?'"
        :title="workspace.name || 'Workspace'"
        :subtitle="workspace.slug ? `/${workspace.slug}` : undefined"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Status</span>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full capitalize" :class="STATUS_STYLES[workspace.status]">
            {{ workspace.status }}
          </span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Apps</span>
          <span class="font-medium">{{ apps.length }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Currency</span>
          <span class="font-medium">{{ workspace.currency }}</span>
        </div>
      </SettingsIdentityCard>

      <div class="space-y-5">
        <SettingsSection :icon="Building2Icon" title="Workspace" description="Public name and URL of your workspace.">
          <div class="space-y-2">
            <Label for="ws-name">Workspace name</Label>
            <Input id="ws-name" v-model="name" />
          </div>
          <div class="space-y-2">
            <Label for="ws-slug">Slug</Label>
            <Input id="ws-slug" v-model="slug" />
          </div>
          <div class="space-y-2">
            <Label for="ws-currency">Default Currency</Label>
            <Select v-model="currency">
              <SelectTrigger id="ws-currency">
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XOF">FCFA (XOF)</SelectItem>
                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="NGN">Naira (NGN)</SelectItem>
                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SettingsSection>

        <SettingsSection :icon="CreditCardIcon" title="Payment gateway" description="Semoa credentials used to process payments for your subscribers.">
          <div class="space-y-2">
            <Label for="semoa-key">Semoa API key</Label>
            <div class="relative">
              <Input
                id="semoa-key"
                v-model="semoaApiKey"
                :type="showApiKey ? 'text' : 'password'"
                placeholder="semoa_live_..."
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                :aria-label="showApiKey ? 'Hide API key' : 'Show API key'"
                @click="showApiKey = !showApiKey"
              >
                <component :is="showApiKey ? EyeOffIcon : EyeIcon" class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="semoa-merchant">Semoa merchant ID</Label>
            <Input id="semoa-merchant" v-model="semoaMerchantId" placeholder="M-XXXXXX" />
          </div>
        </SettingsSection>

        <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {{ errorMessage }}
        </p>

        <Button class="cursor-pointer gap-2" :disabled="isSaving" @click="handleSave">
          <SaveIcon class="w-4 h-4" /> {{ isSaving ? 'Saving...' : saved ? 'Saved' : 'Save changes' }}
        </Button>

        <div v-if="isOwner" class="pt-10 mt-10 border-t border-[var(--color-border-dark)]">
          <SettingsSection 
            :icon="Building2Icon" 
            title="Danger Zone" 
            description="Irreversibly delete this workspace and all of its data. This action cannot be undone."
          >
            <div class="p-4 rounded-xl border border-red-500/30 bg-red-500/10 space-y-4">
              <h3 class="text-sm font-medium text-red-400">Delete Workspace</h3>
              <p class="text-xs text-slate-400">
                Once you delete a workspace, there is no going back. Please be certain.
              </p>
              
              <div v-if="showDeleteConfirm" class="space-y-3 pt-3 border-t border-red-500/20">
                <Label for="delete-confirm" class="text-xs text-slate-300">
                  Type <span class="font-bold text-red-400">{{ workspace.name }}</span> to confirm
                </Label>
                <Input 
                  id="delete-confirm" 
                  v-model="deleteConfirmText" 
                  class="border-red-500/30 focus-visible:ring-red-500/50" 
                  :placeholder="workspace.name"
                />
                <div class="flex items-center gap-3">
                  <Button 
                    variant="destructive" 
                    class="cursor-pointer"
                    :disabled="deleteConfirmText !== workspace.name || isDeleting"
                    @click="handleDelete"
                  >
                    {{ isDeleting ? 'Deleting...' : 'Yes, delete this workspace' }}
                  </Button>
                  <Button 
                    variant="ghost" 
                    class="cursor-pointer"
                    @click="showDeleteConfirm = false; deleteConfirmText = ''"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              
              <Button 
                v-else 
                variant="destructive" 
                class="cursor-pointer" 
                @click="showDeleteConfirm = true"
              >
                Delete Workspace
              </Button>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  </div>
</template>
