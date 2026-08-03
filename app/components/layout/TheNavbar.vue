<!-- app/components/layout/TheNavbar.vue -->
<script setup lang="ts">
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { SearchIcon, BookOpenIcon, GiftIcon, BellIcon, ChevronDownIcon, LayersIcon, WalletIcon, UsersIcon, SettingsIcon } from '@lucide/vue'
import AppSwitcherModal from '~/components/layout/AppSwitcherModal.vue'

const { apps, currentApp } = useApps()
const { mode, toggle } = useEnvMode()
const { user, logout } = useAuth()
const switcherOpen = ref(false)

const navItems = [
  { label: 'Apps', to: '/dashboard', icon: LayersIcon },
  { label: 'Earnings', to: '/earnings', icon: WalletIcon },
  { label: 'Team', to: '/team', icon: UsersIcon },
  { label: 'Settings', to: '/settings', icon: SettingsIcon },
]

function handleLogout() {
  logout()
  navigateTo('/login')
}
</script>

<template>
  <nav class="flex items-center gap-3 md:gap-6 px-3 md:px-6 h-16 border-b border-[var(--color-border-dark)] overflow-x-auto">
    <NuxtLink to="/dashboard" class="font-heading font-semibold text-lg cursor-pointer shrink-0">Klea</NuxtLink>

    <button
      class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer transition-colors duration-200 shrink-0"
      @click="switcherOpen = true"
    >
      <span class="w-5 h-5 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center text-xs font-semibold">
        {{ (currentApp?.name ?? apps[0]?.name ?? 'A')[0] }}
      </span>
      <span class="hidden sm:inline">{{ currentApp?.name ?? apps[0]?.name }}</span>
      <ChevronDownIcon class="w-3.5 h-3.5 text-slate-400" />
    </button>

    <div class="flex items-center gap-1 shrink-0">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors duration-200"
        active-class="bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
        :class="!$route.path.startsWith(item.to) && 'text-slate-400 hover:text-white hover:bg-white/5'"
      >
        <component :is="item.icon" class="w-4 h-4 md:hidden" />
        <span class="hidden md:inline">{{ item.label }}</span>
      </NuxtLink>
    </div>

    <div class="md:ml-auto flex items-center gap-2 md:gap-3 shrink-0">
      <button class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 text-sm text-slate-400 cursor-pointer">
        <SearchIcon class="w-4 h-4" /> Search... <kbd class="text-xs">/</kbd>
      </button>

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
