<!-- app/pages/profile.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { UserIcon, MailIcon, LockIcon, SaveIcon, MailWarningIcon, BadgeCheckIcon } from '@lucide/vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { extractAuthErrorMessage } from '~/composables/useAppAuth'
import SettingsSection from '~/components/dashboard/SettingsSection.vue'
import SettingsIdentityCard from '~/components/dashboard/SettingsIdentityCard.vue'

const { user, updateProfile } = useAppAuth()
const { workspace } = useWorkspace()

const name = ref(user.value?.name ?? '')
const nameSaving = ref(false)
const nameError = ref('')
const nameSaved = ref(false)

const email = ref(user.value?.email ?? '')
const emailSaving = ref(false)
const emailError = ref('')
const emailSaved = ref(false)

const newPassword = ref('')
const newPasswordConfirmation = ref('')
const passwordSaving = ref(false)
const passwordError = ref('')
const passwordSaved = ref(false)

async function saveName() {
  if (!name.value.trim()) return
  nameError.value = ''
  nameSaving.value = true
  try {
    await updateProfile({ name: name.value.trim() })
    nameSaved.value = true
    setTimeout(() => (nameSaved.value = false), 2000)
  } catch (e) {
    nameError.value = extractAuthErrorMessage(e)
  } finally {
    nameSaving.value = false
  }
}

async function saveEmail() {
  if (!email.value.trim()) return
  emailError.value = ''
  emailSaving.value = true
  try {
    await updateProfile({ email: email.value.trim() })
    emailSaved.value = true
    setTimeout(() => (emailSaved.value = false), 2000)
  } catch (e) {
    emailError.value = extractAuthErrorMessage(e)
  } finally {
    emailSaving.value = false
  }
}

async function savePassword() {
  if (!newPassword.value || !newPasswordConfirmation.value) return
  passwordError.value = ''
  passwordSaving.value = true
  try {
    await updateProfile({
      password: newPassword.value,
      password_confirmation: newPasswordConfirmation.value,
    })
    newPassword.value = ''
    newPasswordConfirmation.value = ''
    passwordSaved.value = true
    setTimeout(() => (passwordSaved.value = false), 2000)
  } catch (e) {
    passwordError.value = extractAuthErrorMessage(e)
  } finally {
    passwordSaving.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="font-heading text-2xl font-semibold mb-8">Profile</h1>

    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      <SettingsIdentityCard
        :initial="user?.name?.[0]?.toUpperCase() ?? '?'"
        :title="user?.name ?? 'Your account'"
        :subtitle="user?.email"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Email</span>
          <span
            v-if="user?.email_verified_at"
            class="flex items-center gap-1 text-xs font-medium text-[var(--color-accent)]"
          >
            <BadgeCheckIcon class="w-3.5 h-3.5" /> Verified
          </span>
          <span v-else class="flex items-center gap-1 text-xs font-medium text-amber-400">
            <MailWarningIcon class="w-3.5 h-3.5" /> Unverified
          </span>
        </div>
        <div v-if="workspace.name" class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Workspace</span>
          <span class="font-medium truncate max-w-[140px]">{{ workspace.name }}</span>
        </div>
      </SettingsIdentityCard>

      <div class="space-y-5">
        <SettingsSection :icon="UserIcon" title="Name" description="How your name appears across Klea.">
          <div class="space-y-2">
            <Label for="profile-name">Full name</Label>
            <Input id="profile-name" v-model="name" />
          </div>
          <p v-if="nameError" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {{ nameError }}
          </p>
          <template #footer>
            <Button class="cursor-pointer gap-2" :disabled="nameSaving" @click="saveName">
              <SaveIcon class="w-4 h-4" /> {{ nameSaving ? 'Saving...' : nameSaved ? 'Saved' : 'Save name' }}
            </Button>
          </template>
        </SettingsSection>

        <SettingsSection :icon="MailIcon" title="Email" description="Used to sign in and receive account notifications.">
          <div class="space-y-2">
            <Label for="profile-email">Email address</Label>
            <Input id="profile-email" v-model="email" type="email" />
          </div>
          <p v-if="!user?.email_verified_at" class="flex items-center gap-1.5 text-xs text-amber-400">
            <MailWarningIcon class="w-3.5 h-3.5 shrink-0" />
            This email isn't verified yet.
          </p>
          <p v-if="emailError" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {{ emailError }}
          </p>
          <template #footer>
            <Button class="cursor-pointer gap-2" :disabled="emailSaving" @click="saveEmail">
              <SaveIcon class="w-4 h-4" /> {{ emailSaving ? 'Saving...' : emailSaved ? 'Saved' : 'Save email' }}
            </Button>
          </template>
        </SettingsSection>

        <SettingsSection :icon="LockIcon" title="Password" description="Change your password.">
          <div class="space-y-2">
            <Label for="profile-new-password">New password</Label>
            <Input id="profile-new-password" v-model="newPassword" type="password" />
          </div>
          <div class="space-y-2">
            <Label for="profile-new-password-confirmation">Confirm new password</Label>
            <Input id="profile-new-password-confirmation" v-model="newPasswordConfirmation" type="password" />
          </div>
          <p v-if="passwordError" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {{ passwordError }}
          </p>
          <template #footer>
            <Button class="cursor-pointer gap-2" :disabled="passwordSaving" @click="savePassword">
              <SaveIcon class="w-4 h-4" /> {{ passwordSaving ? 'Saving...' : passwordSaved ? 'Saved' : 'Save password' }}
            </Button>
          </template>
        </SettingsSection>
      </div>
    </div>
  </div>
</template>
