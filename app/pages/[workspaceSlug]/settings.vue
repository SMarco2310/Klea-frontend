<!-- app/pages/settings.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { Building2Icon, SaveIcon } from '@lucide/vue'
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
const isSaving = ref(false)
const saved = ref(false)
const errorMessage = ref('')

const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')
const isDeleting = ref(false)
const { startTour } = useTour()

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
}, { immediate: true })

async function handleSave() {
  isSaving.value = true
  errorMessage.value = ''
  try {
    await updateSettings({
      name: name.value,
      slug: slug.value,
      currency: currency.value,
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
    <div class="flex items-center justify-between mb-8">
      <h1 class="font-heading text-2xl font-semibold">{{ $t('settings.title') }}</h1>
      <Button variant="outline" class="cursor-pointer font-medium" @click="startTour">{{ $t('settings.takeTour') }}</Button>
    </div>

    <p v-if="pending" class="text-sm text-slate-400 mb-4">{{ $t('settings.loadingWorkspace') }}</p>

    <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
      <SettingsIdentityCard
        :initial="workspace.name?.[0]?.toUpperCase() || '?'"
        :title="workspace.name || $t('nav.workspaceFallback')"
        :subtitle="workspace.slug ? `/${workspace.slug}` : undefined"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">{{ $t('settings.statusLabel') }}</span>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full capitalize" :class="STATUS_STYLES[workspace.status]">
            {{ workspace.status }}
          </span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">{{ $t('nav.apps') }}</span>
          <span class="font-medium">{{ apps.length }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">{{ $t('settings.currencyLabel') }}</span>
          <span class="font-medium">{{ workspace.currency }}</span>
        </div>
      </SettingsIdentityCard>

      <div class="space-y-5">
        <SettingsSection :icon="Building2Icon" :title="$t('settings.workspaceSection.title')" :description="$t('settings.workspaceSection.description')">
          <div class="space-y-2">
            <Label for="ws-name">{{ $t('settings.workspaceNameLabel') }}</Label>
            <Input id="ws-name" v-model="name" />
          </div>
          <div class="space-y-2">
            <Label for="ws-slug">{{ $t('settings.slugLabel') }}</Label>
            <Input id="ws-slug" v-model="slug" />
          </div>
          <div class="space-y-2">
            <Label for="ws-currency">{{ $t('settings.defaultCurrencyLabel') }}</Label>
            <Select v-model="currency">
              <SelectTrigger id="ws-currency">
                <SelectValue :placeholder="$t('settings.selectCurrencyPlaceholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XOF">{{ $t('settings.currency.xof') }}</SelectItem>
                <SelectItem value="USD">{{ $t('settings.currency.usd') }}</SelectItem>
                <SelectItem value="EUR">{{ $t('settings.currency.eur') }}</SelectItem>
                <SelectItem value="NGN">{{ $t('settings.currency.ngn') }}</SelectItem>
                <SelectItem value="GBP">{{ $t('settings.currency.gbp') }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SettingsSection>

        <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {{ errorMessage }}
        </p>

        <Button class="cursor-pointer gap-2" :disabled="isSaving" @click="handleSave">
          <SaveIcon class="w-4 h-4" /> {{ isSaving ? $t('settings.saving') : saved ? $t('settings.saved') : $t('settings.saveChanges') }}
        </Button>

        <div v-if="isOwner" class="pt-10 mt-10 border-t border-[var(--color-border-dark)]">
          <SettingsSection
            :icon="Building2Icon"
            :title="$t('settings.dangerZone.title')"
            :description="$t('settings.dangerZone.description')"
          >
            <div class="p-4 rounded-xl border border-red-500/30 bg-red-500/10 space-y-4">
              <h3 class="text-sm font-medium text-red-400">{{ $t('settings.deleteWorkspace') }}</h3>
              <p class="text-xs text-slate-400">
                {{ $t('settings.deleteWorkspaceWarning') }}
              </p>

              <div v-if="showDeleteConfirm" class="space-y-3 pt-3 border-t border-red-500/20">
                <Label for="delete-confirm" class="text-xs text-slate-300">
                  <i18n-t keypath="settings.typeToConfirm" tag="span">
                    <template #name><span class="font-bold text-red-400">{{ workspace.name }}</span></template>
                  </i18n-t>
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
                    {{ isDeleting ? $t('settings.deleting') : $t('settings.confirmDeleteButton') }}
                  </Button>
                  <Button
                    variant="ghost"
                    class="cursor-pointer"
                    @click="showDeleteConfirm = false; deleteConfirmText = ''"
                  >
                    {{ $t('common.cancel') }}
                  </Button>
                </div>
              </div>

              <Button
                v-else
                variant="destructive"
                class="cursor-pointer"
                @click="showDeleteConfirm = true"
              >
                {{ $t('settings.deleteWorkspace') }}
              </Button>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  </div>
</template>
