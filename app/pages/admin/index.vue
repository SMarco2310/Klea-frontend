<!-- app/pages/admin/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

import { LogOutIcon, WalletIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import EmptyState from '~/components/dashboard/EmptyState.vue'
import type { PayoutRequest, PayoutStatus } from '~/composables/useAdminPayouts'

const { admin, logout } = useAdminAuth()
const { requests, pending, error, statusFilter, fetchPayoutRequests, approve, reject, markPaid } = useAdminPayouts()

// The admin middleware already resolved (and validated) the operator, so
// there is no second fetch here — a rejected token redirects before render.
fetchPayoutRequests(statusFilter.value)

const statusOptions: { value: PayoutStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

function onStatusChange(value: unknown) {
  fetchPayoutRequests(value as PayoutStatus | 'all')
}

// Row-level busy flag so only the row being acted on shows a disabled/loading
// state, not the whole table.
const busyRowId = ref<number | null>(null)

async function handleApprove(row: PayoutRequest) {
  busyRowId.value = row.id
  try {
    await approve(row.id)
    toast.success(`Payout #${row.id} approved`)
  } catch (e) {
    // 422 business refusals (wrong status, insufficient balance, KYC gate)
    // carry the real reason in `message` — surface it as-is, not a generic
    // fallback, so an operator sees e.g. the actual available balance.
    toast.error(extractApiErrorMessage(e))
  } finally {
    busyRowId.value = null
  }
}

// Reject/pay both need a note. Reused across both actions with a `mode`
// flag since the UI (dialog asking for a note, required client-side) is
// identical — only the label and the composable call differ.
const noteDialogOpen = ref(false)
const noteDialogMode = ref<'reject' | 'pay'>('reject')
const noteDialogRow = ref<PayoutRequest | null>(null)
const noteValue = ref('')
const noteError = ref('')
const noteSubmitting = ref(false)

function openNoteDialog(row: PayoutRequest, mode: 'reject' | 'pay') {
  noteDialogRow.value = row
  noteDialogMode.value = mode
  noteValue.value = ''
  noteError.value = ''
  noteDialogOpen.value = true
}

async function submitNoteDialog() {
  // Reject requires a note in the UI, not only in the API — the 422 is the
  // backstop, this is the primary guard. Same rule applies to mark-as-paid's
  // payment reference, which reuses this same `note` field.
  if (!noteValue.value.trim()) {
    noteError.value = noteDialogMode.value === 'reject'
      ? 'A note is required to reject a payout.'
      : 'A payment reference is required to mark this payout as paid.'
    return
  }
  const row = noteDialogRow.value
  if (!row) return

  noteSubmitting.value = true
  noteError.value = ''
  try {
    if (noteDialogMode.value === 'reject') {
      await reject(row.id, noteValue.value.trim())
      toast.success(`Payout #${row.id} rejected`)
    } else {
      await markPaid(row.id, noteValue.value.trim())
      toast.success(`Payout #${row.id} marked as paid`)
    }
    noteDialogOpen.value = false
  } catch (e) {
    noteError.value = extractApiErrorMessage(e)
  } finally {
    noteSubmitting.value = false
  }
}

async function handleLogout() {
  await logout()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="font-heading text-2xl font-semibold">Payout review queue</h1>
      <p class="text-sm text-slate-400 mt-1" v-if="admin">Signed in as {{ admin.name }} ({{ admin.email }})</p>
    </div>
    <div class="flex items-center gap-3">
      <NuxtLink to="/admin/wallets">
        <Button variant="secondary" class="cursor-pointer gap-2">
          <WalletIcon class="w-4 h-4" /> Wallet overview
        </Button>
      </NuxtLink>
      <Button variant="ghost" class="cursor-pointer gap-2" @click="handleLogout">
        <LogOutIcon class="w-4 h-4" /> Log out
      </Button>
    </div>
  </div>

  <div class="flex items-center gap-3 mb-6">
    <span class="text-sm text-slate-400">Status</span>
    <Select :model-value="statusFilter" @update:model-value="onStatusChange">
      <SelectTrigger class="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <p v-if="error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
    {{ error }}
  </p>

  <EmptyState
    v-if="!pending && requests.length === 0"
    :icon="WalletIcon"
    title="No payout requests"
    description="There are no payout requests matching this status."
  />

  <div v-else class="overflow-x-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)]">
    <table class="w-full text-left text-sm whitespace-nowrap">
      <thead class="border-b border-[var(--color-border-dark)] bg-[var(--color-surface-muted)]">
        <tr>
          <th class="px-4 py-3 font-medium text-slate-300">Tenant</th>
          <th class="px-4 py-3 font-medium text-slate-300">Requested</th>
          <th class="px-4 py-3 font-medium text-slate-300">Fee</th>
          <th class="px-4 py-3 font-medium text-slate-300">Net</th>
          <th class="px-4 py-3 font-medium text-slate-300">Destination</th>
          <th class="px-4 py-3 font-medium text-slate-300">Requester</th>
          <th class="px-4 py-3 font-medium text-slate-300">Date</th>
          <th class="px-4 py-3 font-medium text-slate-300">Status</th>
          <th class="px-4 py-3 font-medium text-slate-300 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[var(--color-border-dark)]">
        <tr v-for="row in requests" :key="row.id" class="hover:bg-white/5 transition-colors">
          <td class="px-4 py-3">
            <!-- tenant is null for a soft-deleted workspace. Its wallet
                 can still hold money we owe, so the row must render. -->
            <div class="font-medium">{{ row.wallet.tenant?.name ?? 'Deleted workspace' }}</div>
            <div class="text-xs text-slate-500">{{ row.wallet.tenant?.slug ?? `wallet #${row.wallet.id}` }}</div>
          </td>
          <!-- Amounts are decimal:2 strings from the API — displayed
               as-is, never Number()'d or reformatted (float handling of
               these exact values shipped Critical defects previously). -->
          <td class="px-4 py-3 font-mono">{{ row.amount_requested }}</td>
          <td class="px-4 py-3 font-mono text-slate-400">{{ row.fee_amount }}</td>
          <td class="px-4 py-3 font-mono font-medium">{{ row.amount_net }}</td>
          <td class="px-4 py-3 text-slate-300">
            <div>{{ row.destination }}</div>
            <div class="text-xs text-slate-500">{{ row.destination_type === 'mobile_money' ? 'Mobile money' : 'Bank account' }}</div>
          </td>
          <td class="px-4 py-3">
            <div>{{ row.requester.name }}</div>
            <div class="text-xs text-slate-500">{{ row.requester.email }}</div>
          </td>
          <td class="px-4 py-3 text-slate-400">{{ new Date(row.created_at).toLocaleString() }}</td>
          <td class="px-4 py-3">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="{
                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20': row.status === 'pending',
                'bg-blue-500/10 text-blue-400 border border-blue-500/20': row.status === 'approved',
                'bg-green-500/10 text-green-400 border border-green-500/20': row.status === 'paid',
                'bg-red-500/10 text-red-400 border border-red-500/20': row.status === 'rejected',
              }"
            >
              {{ row.status }}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-end gap-2">
              <template v-if="row.status === 'pending'">
                <Button
                  size="sm"
                  class="cursor-pointer"
                  :disabled="busyRowId === row.id"
                  @click="handleApprove(row)"
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  class="cursor-pointer"
                  :disabled="busyRowId === row.id"
                  @click="openNoteDialog(row, 'reject')"
                >
                  Reject
                </Button>
              </template>
              <template v-else-if="row.status === 'approved'">
                <Button
                  size="sm"
                  class="cursor-pointer"
                  :disabled="busyRowId === row.id"
                  @click="openNoteDialog(row, 'pay')"
                >
                  Mark as paid
                </Button>
              </template>
              <span v-else class="text-xs text-slate-500">No actions</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

<Dialog v-model:open="noteDialogOpen">
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{{ noteDialogMode === 'reject' ? 'Reject payout' : 'Mark payout as paid' }}</DialogTitle>
      <DialogDescription>
        {{ noteDialogMode === 'reject'
          ? 'A note is required and will be visible as the reason for rejection.'
          : 'Enter the payment reference used to complete this transfer.' }}
      </DialogDescription>
    </DialogHeader>
    <div class="space-y-2 py-2">
      <Label for="note">{{ noteDialogMode === 'reject' ? 'Reason' : 'Payment reference' }}</Label>
      <textarea
        id="note"
        v-model="noteValue"
        rows="3"
        :placeholder="noteDialogMode === 'reject' ? 'Why is this payout being rejected?' : 'e.g. bank transfer ref, transaction ID'"
        class="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:ring-3 placeholder:text-muted-foreground"
      />
      <p v-if="noteError" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
        {{ noteError }}
      </p>
    </div>
    <DialogFooter>
      <Button variant="ghost" class="cursor-pointer" @click="noteDialogOpen = false">Cancel</Button>
      <Button class="cursor-pointer" :disabled="noteSubmitting" @click="submitNoteDialog">
        {{ noteSubmitting ? 'Submitting...' : (noteDialogMode === 'reject' ? 'Reject' : 'Mark as paid') }}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
</template>
