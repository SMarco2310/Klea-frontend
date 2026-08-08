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

onMounted(fetchInvitations)

// The API only tells us our own membership + role in a tenant, not the
// full member list — until it exposes a tenant-members endpoint, "Members"
// can only show the signed-in user honestly.
const yourRole = computed(
  () => user.value?.tenants?.find((t) => t.id === user.value?.current_tenant_id)?.pivot?.role ?? 'member'
)

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
        <h1 class="font-heading text-2xl font-semibold">Team</h1>
        <p class="text-sm text-slate-400 mt-0.5">Manage your workspace members and their roles.</p>
      </div>
      <Button class="cursor-pointer gap-1" @click="inviteOpen = true">
        <UserPlusIcon class="w-4 h-4" /> Invite member
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      <SettingsIdentityCard
        :initial="workspace.name?.[0]?.toUpperCase() || '?'"
        :title="workspace.name || 'Workspace'"
        :subtitle="workspace.slug ? `/${workspace.slug}` : undefined"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Your role</span>
          <span class="font-medium capitalize">{{ yourRole }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Pending invites</span>
          <span class="font-medium">{{ invitations.length }}</span>
        </div>
      </SettingsIdentityCard>

      <div class="space-y-5">
        <SettingsSection :icon="UsersIcon" title="Members" description="People with access to this workspace.">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold shrink-0">
              {{ (user?.name || user?.email || '?').charAt(0).toUpperCase() }}
            </span>
            <div class="min-w-0">
              <div class="font-medium truncate">
                {{ user?.name }} <span class="text-xs text-slate-500 font-normal">(you)</span>
              </div>
              <div class="text-xs text-slate-400 truncate">{{ user?.email }}</div>
            </div>
            <span class="ml-auto text-xs text-slate-400 font-medium capitalize shrink-0">{{ yourRole }}</span>
          </div>
        </SettingsSection>

        <SettingsSection :icon="MailIcon" title="Pending invitations" description="Invites waiting to be accepted.">
          <p v-if="pending" class="text-sm text-slate-400">Loading invitations...</p>
          <EmptyState
            v-else-if="invitations.length === 0"
            :icon="MailIcon"
            title="No pending invitations"
            description="Invite a teammate to give them access to this workspace."
            cta-label="Invite member"
            @cta="inviteOpen = true"
          />
          <div v-else class="divide-y divide-[var(--color-border-dark)]">
            <div v-for="inv in invitations" :key="inv.id" class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div class="min-w-0">
                <div class="font-medium truncate">{{ inv.email }}</div>
                <div class="text-xs text-slate-400">
                  Invited as <span class="capitalize">{{ inv.role }}</span> · expires {{ formatDate(inv.expires_at) }}
                </div>
              </div>
              <button
                class="text-slate-500 hover:text-red-400 cursor-pointer shrink-0 transition-colors"
                :aria-label="`Revoke invite to ${inv.email}`"
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
          <DialogTitle>Revoke invitation</DialogTitle>
          <DialogDescription>They won't be able to accept this invite anymore.</DialogDescription>
        </DialogHeader>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" :disabled="isRevoking" @click="pendingRevokeId = null">Cancel</Button>
          <Button variant="destructive" class="cursor-pointer" :disabled="isRevoking" @click="confirmRevoke">
            {{ isRevoking ? 'Revoking...' : 'Revoke invite' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="inviteOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            They will receive an email invitation to join your workspace.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div v-if="inviteSuccess" class="p-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
            Invitation sent successfully!
          </div>
          <template v-else>
            <div class="space-y-2">
              <Label for="email">Email address</Label>
              <Input id="email" v-model="inviteEmail" type="email" placeholder="colleague@example.com" @keyup.enter="handleInvite" />
            </div>
            <div class="space-y-2">
              <Label>Role</Label>
              <Select v-model="inviteRole">
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p v-if="inviteError" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
              {{ inviteError }}
            </p>
          </template>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="cursor-pointer" :disabled="isInviting || inviteSuccess" @click="inviteOpen = false">Cancel</Button>
          <Button class="cursor-pointer" :disabled="isInviting || !inviteEmail.trim() || inviteSuccess" @click="handleInvite">
            {{ isInviting ? 'Sending...' : 'Send invite' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
