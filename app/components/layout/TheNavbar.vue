<!-- app/components/layout/TheNavbar.vue -->
<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { BookOpenIcon, GiftIcon, BellIcon, ChevronDownIcon, MenuIcon, SunIcon, MoonIcon } from '@lucide/vue'
import AppSwitcherModal from '~/components/layout/AppSwitcherModal.vue'
import { toast } from 'vue-sonner'

const { apps, currentApp } = useApps()
const { mode, toggle } = useEnvMode()
const { user, logout } = useAppAuth()
const { toggleSidebar } = useSidebar()
const { isDark, toggleDark } = useTheme()
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

function handleWorkspaceSwitch() {
  toast.success('Switched workspace successfully')
}
</script>

<template>
  <nav class="flex items-center gap-3 md:gap-6 px-3 md:px-6 h-16 overflow-x-auto relative z-50 bg-[var(--color-surface)]">
    <button
      class="flex items-center justify-center w-8 h-8 rounded-md hover:bg-[var(--color-hover)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer transition-colors duration-200 shrink-0 relative z-50"
      @click="toggleSidebar"
      aria-label="Toggle Sidebar"
    >
      <MenuIcon class="w-5 h-5" />
    </button>
    <NuxtLink to="/dashboard" class="font-heading font-semibold text-lg cursor-pointer shrink-0">Klea<span class="text-[var(--color-accent)]">.</span></NuxtLink>

    <div class="flex items-center gap-1.5 shrink-0">
      <span class="text-[var(--muted-foreground)]">/</span>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[var(--color-hover)] cursor-pointer transition-colors duration-200">
            <span class="hidden sm:inline">{{ currentTenant?.name ?? 'Workspace' }}</span>
            <ChevronDownIcon class="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem v-if="currentTenant" class="cursor-pointer" @click="handleWorkspaceSwitch">
            {{ currentTenant.name }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <span class="text-[var(--muted-foreground)]">/</span>

      <button
        class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] hover:bg-[var(--color-hover)] cursor-pointer transition-colors duration-200"
        @click="switcherOpen = true"
      >
        <template v-if="currentApp">
          <span class="w-5 h-5 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center text-xs font-semibold">
            {{ currentApp.name[0] }}
          </span>
          <span class="hidden sm:inline">{{ currentApp.name }}</span>
        </template>
        <template v-else>
          <span class="hidden sm:inline text-[var(--muted-foreground)]">Select App</span>
        </template>
        <ChevronDownIcon class="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
      </button>
    </div>

    <div class="md:ml-auto flex items-center gap-2 md:gap-3 shrink-0">
      <button
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors duration-200"
        :class="mode === 'test' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'text-[var(--muted-foreground)]'"
        @click="mode === 'live' && toggle()"
      >
        Test
      </button>
      <button
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors duration-200"
        :class="mode === 'live' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'text-[var(--muted-foreground)]'"
        @click="mode === 'test' && toggle()"
      >
        Live
      </button>

      <NuxtLink to="/docs" class="hidden lg:flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer">
        <BookOpenIcon class="w-4 h-4" /> Docs
      </NuxtLink>

      <button
        class="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--color-surface-muted)]"
        @click="toggleDark()"
        aria-label="Toggle theme"
      >
        <MoonIcon v-if="!isDark" class="w-4 h-4" />
        <SunIcon v-else class="w-4 h-4" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer transition-colors flex items-center justify-center h-8 px-2 rounded-md hover:bg-[var(--color-surface-muted)] text-xs font-medium"
            aria-label="Change language"
          >
            EN
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem class="cursor-pointer font-medium" @click="toast.success('Switched to English')">English (EN)</DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer" @click="toast.success('Switched to French')">Français (FR)</DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer" @click="toast.success('Switched to Spanish')">Español (ES)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BellIcon class="w-4 h-4 text-[var(--muted-foreground)] cursor-pointer" aria-label="Notifications" />

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="w-8 h-8 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] flex items-center justify-center text-xs font-semibold cursor-pointer"
            :aria-label="`Account menu for ${user?.name ?? 'user'}`"
          >
            {{ user?.name?.[0]?.toUpperCase() ?? 'A' }}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem class="cursor-pointer lg:hidden" @click="navigateTo('/docs')">Docs</DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer" @click="navigateTo('/profile')">Profile</DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer" @click="navigateTo('/settings')">Settings</DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer" @click="handleLogout">Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </nav>
  <AppSwitcherModal v-model:open="switcherOpen" />
</template>
