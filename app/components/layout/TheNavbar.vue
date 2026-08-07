<!-- app/components/layout/TheNavbar.vue -->
<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { BookOpenIcon, GiftIcon, BellIcon, ChevronDownIcon } from '@lucide/vue'
import AppSwitcherModal from '~/components/layout/AppSwitcherModal.vue'
import MainNavMenu from '~/components/layout/MainNavMenu.vue'

const { apps, currentApp } = useApps()
const { mode, toggle } = useEnvMode()
const { user, logout } = useAppAuth()
const switcherOpen = ref(false)

// Tenant switching isn't wired to the backend yet (GET /tenants /
// POST /me/switch-tenant exist but aren't called from here) — this shows
// the user's real current tenant, but the dropdown is a single-item list
// until multi-tenant switching is built.
const currentTenant = computed(() => user.value?.tenants?.find((t) => t.id === user.value?.current_tenant_id))

async function handleLogout() {
  await logout()
  navigateTo('/login')
}
</script>

<template>
  <nav class="flex items-center gap-3 md:gap-6 px-3 md:px-6 h-16 border-b border-[var(--color-border-dark)] overflow-x-auto">
    <MainNavMenu />

    <NuxtLink to="/dashboard" class="font-heading font-semibold text-lg cursor-pointer shrink-0">Klea<span class="text-[var(--color-accent)]">.</span></NuxtLink>

    <div class="flex items-center gap-1.5 shrink-0">
      <span class="text-slate-600">/</span>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white/5 cursor-pointer transition-colors duration-200">
            <span class="hidden sm:inline">{{ currentTenant?.name ?? 'Workspace' }}</span>
            <ChevronDownIcon class="w-3.5 h-3.5 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem v-if="currentTenant" class="cursor-pointer" disabled>
            {{ currentTenant.name }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <span class="text-slate-600">/</span>

      <button
        class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer transition-colors duration-200"
        @click="switcherOpen = true"
      >
        <span class="w-5 h-5 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center text-xs font-semibold">
          {{ (currentApp?.name ?? apps[0]?.name ?? 'A')[0] }}
        </span>
        <span class="hidden sm:inline">{{ currentApp?.name ?? apps[0]?.name }}</span>
        <ChevronDownIcon class="w-3.5 h-3.5 text-slate-400" />
      </button>
    </div>

    <div class="md:ml-auto flex items-center gap-2 md:gap-3 shrink-0">
      <button
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors duration-200"
        :class="mode === 'test' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'text-slate-500'"
        @click="mode === 'live' && toggle()"
      >
        Test
      </button>
      <button
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors duration-200"
        :class="mode === 'live' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'text-slate-500'"
        @click="mode === 'test' && toggle()"
      >
        Live
      </button>

      <NuxtLink to="/docs" class="hidden lg:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white cursor-pointer">
        <BookOpenIcon class="w-4 h-4" /> Docs
      </NuxtLink>
      <GiftIcon class="hidden sm:block w-4 h-4 text-slate-400 cursor-pointer" />
      <BellIcon class="w-4 h-4 text-slate-400 cursor-pointer" aria-label="Notifications" />

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold cursor-pointer"
            :aria-label="`Account menu for ${user?.name ?? 'user'}`"
          >
            {{ (user?.name ?? 'A')[0].toUpperCase() }}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem class="cursor-pointer lg:hidden" @click="navigateTo('/docs')">Docs</DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer" @click="navigateTo('/settings')">Settings</DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer" @click="handleLogout">Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </nav>
  <AppSwitcherModal v-model:open="switcherOpen" />
</template>
