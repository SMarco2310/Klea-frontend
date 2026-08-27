<!-- app/layouts/admin.vue -->
<script setup lang="ts">
// The operator console's own shell. It deliberately does NOT reuse
// layouts/dashboard.vue: that one calls useApps() and useWorkspace(), which are
// tenant concepts an operator does not have — an operator sits above tenants,
// so there is no "current workspace" to load. Same visual structure, different
// navigation and no tenant data fetching.
import { LayoutListIcon, WalletIcon, LogOutIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'

const { admin, logout } = useAdminAuth()
const route = useRoute()

const navItems = [
  { label: 'Payout queue', to: '/admin', icon: LayoutListIcon },
  { label: 'Wallet overview', to: '/admin/wallets', icon: WalletIcon },
]

// Exact match for /admin so it does not stay highlighted on /admin/wallets.
const isActive = (to: string) => (to === '/admin' ? route.path === '/admin' : route.path.startsWith(to))

async function handleLogout() {
  await logout()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="h-screen flex flex-col bg-[var(--color-surface)] overflow-hidden">
    <header class="flex items-center justify-between px-5 h-16 shrink-0">
      <div class="flex items-center gap-3">
        <span class="notranslate text-xl font-heading font-bold tracking-tight">
          Klea<span class="text-[var(--color-accent)]">.</span>
        </span>
        <!-- Says plainly this is not the tenant dashboard: an operator acts
             across every tenant, and mistaking the two would be costly. -->
        <span class="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
          Operator
        </span>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="admin" class="text-sm text-[var(--muted-foreground)] hidden sm:inline">{{ admin.email }}</span>
        <Button variant="secondary" size="sm" class="cursor-pointer gap-2" @click="handleLogout">
          <LogOutIcon class="w-4 h-4" /> Sign out
        </Button>
      </div>
    </header>

    <div class="flex flex-1 min-h-0">
      <aside class="w-64 shrink-0 bg-[var(--color-surface)] overflow-y-auto">
        <nav class="p-4">
          <h3 class="px-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
            Platform
          </h3>
          <ul class="space-y-1">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="flex items-center gap-3 px-3.5 py-3 rounded-md text-sm cursor-pointer transition-colors duration-200"
                :class="isActive(item.to)
                  ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--color-hover)]'"
              >
                <component :is="item.icon" class="w-[18px] h-[18px]" />
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </aside>

      <div class="flex-1 mx-1.5 mb-1.5 min-w-0 overflow-y-auto bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border-dark)] flex flex-col relative">
        <div class="bg-grid-pattern" aria-hidden="true" />
        <div class="relative z-[1] flex flex-col flex-1 w-full">
          <main class="px-6 py-8 max-w-[1600px] mx-auto flex-1 w-full">
            <slot />
          </main>
        </div>
      </div>
    </div>
  </div>
</template>
