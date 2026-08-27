<!-- app/pages/admin/wallets.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

import { ArrowLeftIcon, AlertTriangleIcon, LogOutIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import EmptyState from '~/components/dashboard/EmptyState.vue'

const { admin, logout } = useAdminAuth()
const { wallets, platformLiability, pending, error, fetchWallets } = useAdminWallets()

// The admin middleware already resolved (and validated) the operator, so
// there is no second fetch here — a rejected token redirects before render.
fetchWallets()

async function handleLogout() {
  await logout()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="font-heading text-2xl font-semibold">Wallet overview</h1>
      <p class="text-sm text-slate-400 mt-1" v-if="admin">Signed in as {{ admin.name }} ({{ admin.email }})</p>
    </div>
    <div class="flex items-center gap-3">
      <NuxtLink to="/admin">
        <Button variant="secondary" class="cursor-pointer gap-2">
          <ArrowLeftIcon class="w-4 h-4" /> Payout queue
        </Button>
      </NuxtLink>
      <Button variant="ghost" class="cursor-pointer gap-2" @click="handleLogout">
        <LogOutIcon class="w-4 h-4" /> Log out
      </Button>
    </div>
  </div>

  <div class="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)] mb-6">
    <div class="text-xs uppercase tracking-wide text-slate-400 mb-2">Platform liability</div>
    <!-- Platform liability is a decimal:2 string from the API — shown
         as-is, never Number()'d/summed/reformatted in JS. -->
    <div class="text-4xl font-heading font-bold font-mono">{{ platformLiability }}</div>
    <p class="text-xs text-slate-500 mt-1">Total balance owed across all tenant wallets.</p>
  </div>

  <p v-if="error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
    {{ error }}
  </p>

  <EmptyState
    v-if="!pending && wallets.length === 0"
    :icon="AlertTriangleIcon"
    title="No wallets"
    description="No tenant wallets were found."
  />

  <div v-else class="overflow-x-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-dark)]">
    <table class="w-full text-left text-sm whitespace-nowrap">
      <thead class="border-b border-[var(--color-border-dark)] bg-[var(--color-surface-muted)]">
        <tr>
          <th class="px-4 py-3 font-medium text-slate-300">Tenant</th>
          <th class="px-4 py-3 font-medium text-slate-300">Environment</th>
          <th class="px-4 py-3 font-medium text-slate-300">Balance</th>
          <th class="px-4 py-3 font-medium text-slate-300">Computed balance</th>
          <th class="px-4 py-3 font-medium text-slate-300">Currency</th>
          <th class="px-4 py-3 font-medium text-slate-300">Integrity</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[var(--color-border-dark)]">
        <tr
          v-for="wallet in wallets"
          :key="wallet.id"
          class="transition-colors"
          :class="wallet.has_drift ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/5'"
        >
          <td class="px-4 py-3">
            <!-- tenant is null for a soft-deleted workspace. Its balance
                 is still platform liability, so the row must render. -->
            <div class="font-medium">{{ wallet.tenant?.name ?? 'Deleted workspace' }}</div>
            <div class="text-xs text-slate-500">{{ wallet.tenant?.slug ?? `wallet #${wallet.id}` }}</div>
          </td>
          <td class="px-4 py-3">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="wallet.environment === 'live'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-slate-500/10 text-slate-300 border border-slate-500/20'"
            >
              {{ wallet.environment }}
            </span>
          </td>
          <!-- balance/computed_balance are decimal:2 strings — displayed
               as-is per the money-string rule. -->
          <td class="px-4 py-3 font-mono">{{ wallet.balance }}</td>
          <td class="px-4 py-3 font-mono text-slate-400">{{ wallet.computed_balance }}</td>
          <td class="px-4 py-3 text-slate-300">{{ wallet.currency }}</td>
          <td class="px-4 py-3">
            <span
              v-if="wallet.has_drift"
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30"
              title="Cached balance does not match the computed balance from ledger entries — not trustworthy."
            >
              <AlertTriangleIcon class="w-3.5 h-3.5" /> Drift detected
            </span>
            <span v-else class="text-xs text-slate-500">OK</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
