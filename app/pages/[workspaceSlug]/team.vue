<!-- app/pages/team.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { UserPlusIcon, UsersIcon, MailIcon, Trash2Icon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { formatDate } from '~/utils/format'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import SettingsSection from '~/components/dashboard/SettingsSection.vue'
import SettingsIdentityCard from '~/components/dashboard/SettingsIdentityCard.vue'

const { user } = useAppAuth()
const { workspace } = useWorkspace()
const { invitations, pending, fetchInvitations, inviteMember, revokeInvitation } = useTeam()
const { t } = useI18n()

onMounted(fetchInvitations)

// The API only tells us our own membership + role in a tenant, not the
// full member list — until it exposes a tenant-members endpoint, "Members"
// can only show the signed-in user honestly.
const yourRole = computed(
  () => user.value?.tenants?.find((tenant) => tenant.id === user.value?.current_tenant_id)?.pivot?.role ?? 'member'
)

// Display labels for the 'admin' | 'member' role enum — computed so they
// re-evaluate on locale switch. The raw role values themselves (sent to/
// received from the API) are never translated.
const roleLabels = computed<Record<string, string>>(() => ({
  admin: t('team.roleAdmin'),
  member: t('team.roleMember'),
}))

const inviteOpen = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('member')
const isInviting = ref(false)
const inviteError = ref('')
const inviteSuccess = ref(false)

async function handleInvite() {
  if (!inviteEmail.value.trim()) return
  isInviting.value = true
  inviteError.value = ''
  try {
    await inviteMember(inviteEmail.value.trim(), inviteRole.value)
    inviteSuccess.value = true
    setTimeout(() => {
      inviteOpen.value = false
      inviteEmail.value = ''
      inviteRole.value = 'member'
      inviteSuccess.value = false
    }, 1500)
  } catch (e) {
    inviteError.value = extractApiErrorMessage(e)
  } finally {
    isInviting.value = false
  }
}

const pendingRevokeId = ref<number | null>(null)
const isRevoking = ref(false)

async function confirmRevoke() {
  if (!pendingRevokeId.value) return
  isRevoking.value = true
  try {
    await revokeInvitation(pendingRevokeId.value)
    pendingRevokeId.value = null
  } finally {
    isRevoking.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="font-heading text-2xl font-semibold">{{ $t('team.title') }}</h1>
        <p class="text-sm text-slate-400 mt-0.5">{{ $t('team.subtitle') }}</p>
      </div>
      <Button class="cursor-pointer gap-1" @click="inviteOpen = true">
        <UserPlusIcon class="w-4 h-4" /> {{ $t('team.inviteMember') }}
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
      <SettingsIdentityCard
        :initial="workspace.name?.[0]?.toUpperCase() || '?'"
        :title="workspace.name || $t('nav.workspaceFallback')"
        :subtitle="workspace.slug ? `/${workspace.slug}` : undefined"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">{{ $t('team.yourRoleLabel') }}</span>
          <span class="font-medium capitalize">{{ roleLabels[yourRole] ?? yourRole }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">{{ $t('team.pendingInvitesLabel') }}</span>
          <span class="font-medium">{{ invitations.length }}</span>
        </div>
      </SettingsIdentityCard>

      <div class="space-y-5">
        <SettingsSection :icon="UsersIcon" :title="$t('team.membersSection.title')" :description="$t('team.membersSection.description')">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold shrink-0">
              {{ (user?.name || user?.email || '?').charAt(0).toUpperCase() }}
            </span>
            <div class="min-w-0">
              <div class="font-medium truncate">
                {{ user?.name }} <span class="text-xs text-slate-500 font-normal">{{ $t('team.youSuffix') }}</span>
              </div>
              <div class="text-xs text-slate-400 truncate">{{ user?.email }}</div>
            </div>
            <span class="ml-auto text-xs text-slate-400 font-medium capitalize shrink-0">{{ roleLabels[yourRole] ?? yourRole }}</span>
          </div>
        </SettingsSection>

        <SettingsSection :icon="MailIcon" :title="$t('team.pendingInvitationsSection.title')" :description="$t('team.pendingInvitationsSection.description')">
          <p v-if="pending" class="text-sm text-slate-400">{{ $t('team.loadingInvitations') }}</p>
          <EmptyState
            v-else-if="invitations.length === 0"
            :icon="MailIcon"
            :title="$t('team.noInvitationsTitle')"
            :description="$t('team.noInvitationsDescription')"
            :cta-label="$t('team.inviteMember')"
            @cta="inviteOpen = true"
          />
          <div v-else class="divide-y divide-[var(--color-border-dark)]">
            <div v-for="inv in invitations" :key="inv.id" class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div class="min-w-0">
                <div class="font-medium truncate">{{ inv.email }}</div>
                <div class="text-xs text-slate-400">
                  <i18n-t keypath="team.invitedAs" tag="span">
                    <template #role><span class="capitalize">{{ roleLabels[inv.role] ?? inv.role }}</span></template>
                    <template #date>{{ formatDate(inv.expires_at) }}</template>
                  </i18n-t>
                </div>
              </div>
              <button
                class="text-slate-500 hover:text-red-400 cursor-pointer shrink-0 transition-colors"
                :aria-label="$t('team.revokeInviteAria', { email: inv.email })"
                @click="pendingRevokeId = inv.id"
              >
                <Trash2Icon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>

    <Dialog :open="!!pendingRevokeId" @update:open="pendingRevokeId = null">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ $t('team.revokeDialog.title') }}</DialogTitle>
          <DialogDescription>{{ $t('team.revokeDialog.description') }}</DialogDescription>
        </DialogHeader>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" :disabled="isRevoking" @click="pendingRevokeId = null">{{ $t('common.cancel') }}</Button>
          <Button variant="destructive" class="cursor-pointer" :disabled="isRevoking" @click="confirmRevoke">
            {{ isRevoking ? $t('team.revoking') : $t('team.revokeInviteButton') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="inviteOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ $t('team.inviteDialog.title') }}</DialogTitle>
          <DialogDescription>
            {{ $t('team.inviteDialog.description') }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div v-if="inviteSuccess" class="p-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
            {{ $t('team.invitationSentSuccess') }}
          </div>
          <template v-else>
            <div class="space-y-2">
              <Label for="email">{{ $t('common.emailAddress') }}</Label>
              <Input id="email" v-model="inviteEmail" type="email" placeholder="colleague@example.com" @keyup.enter="handleInvite" />
            </div>
            <div class="space-y-2">
              <Label>{{ $t('team.roleLabel') }}</Label>
              <Select v-model="inviteRole">
                <SelectTrigger>
                  <SelectValue :placeholder="$t('team.selectRolePlaceholder')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{{ $t('team.roleAdmin') }}</SelectItem>
                  <SelectItem value="member">{{ $t('team.roleMember') }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p v-if="inviteError" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
              {{ inviteError }}
            </p>
          </template>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" :disabled="isInviting || inviteSuccess" @click="inviteOpen = false">{{ $t('common.cancel') }}</Button>
          <Button class="cursor-pointer" :disabled="isInviting || !inviteEmail.trim() || inviteSuccess" @click="handleInvite">
            {{ isInviting ? $t('team.sending') : $t('team.sendInvite') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
