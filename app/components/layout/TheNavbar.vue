<!-- app/components/layout/TheNavbar.vue -->
<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { BookOpenIcon, GiftIcon, BellIcon, ChevronDownIcon, MenuIcon, SunIcon, MoonIcon, LanguagesIcon, MonitorIcon, SettingsIcon, LogOutIcon } from '@lucide/vue'
import AppSwitcherModal from '~/components/layout/AppSwitcherModal.vue'
import { toast } from 'vue-sonner'

const { apps, currentApp } = useApps()
const { mode, toggle } = useEnvMode()
const { user, logout } = useAppAuth()
const { toggleSidebar } = useSidebar()
const { colorMode } = useTheme()
const { recentTransactions } = useNotifications()
const { workspace } = useWorkspace()
const { currentLang, setLanguage } = useGoogleTranslate()
const switcherOpen = ref(false)

async function handleLogout() {
  await logout()
  navigateTo('/login')
}

function handleWorkspaceSwitch() {
  toast.success('Switched workspace successfully')
}

function changeLanguage(lang: 'en' | 'fr' | 'es', label: string) {
  setLanguage(lang)
  toast.success(`Switched to ${label}`)
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
    <NuxtLink :to="workspace.slug ? `/${workspace.slug}/dashboard` : '/dashboard'" class="notranslate font-heading font-semibold text-lg cursor-pointer shrink-0">Klea<span class="text-[var(--color-accent)]">.</span></NuxtLink>

    <div class="flex items-center gap-1.5 shrink-0">
      <span class="text-[var(--muted-foreground)]">/</span>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button id="tour-workspace" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[var(--color-hover)] cursor-pointer transition-colors duration-200">
            <span class="hidden sm:inline">{{ workspace?.name || 'Workspace' }}</span>
            <ChevronDownIcon class="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem v-if="workspace?.name" class="cursor-pointer" @click="handleWorkspaceSwitch">
            {{ workspace.name }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <span class="text-[var(--muted-foreground)]">/</span>

      <button
        id="tour-app-switcher"
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
      <div id="tour-env-toggle" class="flex bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-lg p-1 shrink-0">
        <button
          class="px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-200"
          :class="mode === 'test' ? 'bg-amber-400/25 text-amber-700 dark:text-amber-400 shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--color-hover)]'"
          @click="mode === 'live' && toggle()"
        >
          Test
        </button>
        <button
          class="px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-200"
          :class="mode === 'live' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--color-hover)]'"
          @click="mode === 'test' && toggle()"
        >
          Live
        </button>
      </div>

      <NuxtLink to="/docs" class="hidden lg:flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer">
        <BookOpenIcon class="w-4 h-4" /> Docs
      </NuxtLink>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer transition-colors flex items-center gap-1.5 justify-center h-8 px-2.5 rounded-md hover:bg-[var(--color-surface-muted)] text-xs font-medium"
            aria-label="Change language"
          >
            <LanguagesIcon class="w-4 h-4" />
            {{ currentLang.toUpperCase() }}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem class="cursor-pointer font-medium" @click="changeLanguage('en', 'English')">English (EN)</DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer" @click="changeLanguage('fr', 'Français')">Français (FR)</DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer" @click="changeLanguage('es', 'Español')">Español (ES)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button class="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-muted)] cursor-pointer transition-colors" aria-label="Notifications">
            <BellIcon class="w-4 h-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" />
            <span v-if="recentTransactions.length > 0" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[var(--color-surface)]"></span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-80 p-0 border border-[var(--color-border-dark)] overflow-hidden">
          <div class="px-4 py-3 bg-[var(--color-surface-muted)] border-b border-[var(--color-border-dark)] flex items-center justify-between">
            <h3 class="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Recent Payments</h3>
          </div>
          <div class="max-h-80 overflow-y-auto">
            <div v-if="recentTransactions.length === 0" class="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
              No recent payments.
            </div>
            <div v-else class="divide-y divide-[var(--color-border-dark)]">
              <div v-for="tx in recentTransactions" :key="tx.id" class="px-4 py-3 hover:bg-[var(--color-surface-muted)] transition-colors cursor-default">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <p class="text-sm font-medium text-[var(--foreground)]">New Payment</p>
                    <p class="text-xs text-[var(--muted-foreground)]">
                      {{ tx.currency }} {{ tx.amount.toLocaleString() }} via {{ tx.payment_method }}
                    </p>
                  </div>
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    :class="{
                      'bg-green-500/10 text-green-400': tx.status === 'successful',
                      'bg-yellow-500/10 text-yellow-400': tx.status === 'pending',
                      'bg-red-500/10 text-red-400': tx.status === 'failed'
                    }"
                  >
                    {{ tx.status }}
                  </span>
                </div>
                <div class="mt-2 text-[10px] text-[var(--muted-foreground)]">
                  {{ new Date(tx.created_at).toLocaleString() }}
                </div>
              </div>
            </div>
          </div>
          <div class="p-2 border-t border-[var(--color-border-dark)] bg-[var(--color-surface)]">
            <NuxtLink :to="`/${workspace.slug}/earnings`" class="block w-full text-center text-xs font-medium text-[var(--color-accent)] hover:underline py-1.5 rounded-md hover:bg-[var(--color-surface-muted)] transition-colors">
              View all transactions
            </NuxtLink>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="w-8 h-8 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] flex items-center justify-center text-xs font-semibold cursor-pointer"
            :aria-label="`Account menu for ${user?.name ?? 'user'}`"
          >
            {{ user?.name?.[0]?.toUpperCase() ?? 'A' }}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-64 p-2 rounded-2xl">
          <button
            class="w-full flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-[var(--color-hover)] transition-colors text-left"
            @click="navigateTo(`/${workspace.slug}/profile`)"
          >
            <span class="w-10 h-10 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center text-sm font-semibold shrink-0">
              {{ user?.name?.[0]?.toUpperCase() ?? 'A' }}
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-[var(--foreground)] truncate">{{ user?.name ?? 'Account' }}</span>
              <span class="block text-xs text-[var(--muted-foreground)] truncate">{{ user?.email }}</span>
            </span>
          </button>

          <DropdownMenuSeparator />

          <div class="flex items-center gap-1 p-1 mb-1 rounded-xl bg-[var(--color-surface-muted)]">
            <button
              class="flex-1 flex items-center justify-center h-8 rounded-lg cursor-pointer transition-colors"
              :class="colorMode === 'light' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-accent)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
              aria-label="Light mode"
              @click="colorMode = 'light'"
            >
              <SunIcon class="w-4 h-4" />
            </button>
            <button
              class="flex-1 flex items-center justify-center h-8 rounded-lg cursor-pointer transition-colors"
              :class="colorMode === 'dark' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-accent)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
              aria-label="Dark mode"
              @click="colorMode = 'dark'"
            >
              <MoonIcon class="w-4 h-4" />
            </button>
            <button
              class="flex-1 flex items-center justify-center h-8 rounded-lg cursor-pointer transition-colors"
              :class="colorMode === 'auto' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-accent)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
              aria-label="System theme"
              @click="colorMode = 'auto'"
            >
              <MonitorIcon class="w-4 h-4" />
            </button>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem class="cursor-pointer lg:hidden gap-3 px-3 py-2.5 rounded-xl text-sm font-medium" @click="navigateTo('/docs')">
            <BookOpenIcon class="w-[18px] h-[18px] text-[var(--muted-foreground)]" />
            Docs
          </DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer gap-3 px-3 py-2.5 rounded-xl text-sm font-medium" @click="navigateTo(`/${workspace.slug}/settings`)">
            <SettingsIcon class="w-[18px] h-[18px] text-[var(--muted-foreground)]" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="cursor-pointer gap-3 px-3 py-2.5 rounded-xl text-sm font-medium" @click="handleLogout">
            <LogOutIcon class="w-[18px] h-[18px] text-[var(--muted-foreground)]" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </nav>
  <AppSwitcherModal v-model:open="switcherOpen" />
</template>
