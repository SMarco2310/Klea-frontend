<!-- app/components/layout/MainNavMenu.vue -->
<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { MenuIcon, XIcon, LayersIcon, WalletIcon, UsersIcon, SettingsIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'

const open = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

const navItems = [
  { label: 'Apps', to: '/dashboard', icon: LayersIcon },
  { label: 'Earnings', to: '/earnings', icon: WalletIcon },
  { label: 'Team', to: '/team', icon: UsersIcon },
  { label: 'Settings', to: '/settings', icon: SettingsIcon },
]

function go(to: string) {
  open.value = false
  navigateTo(to)
}

onClickOutside(panelRef, () => { open.value = false }, { ignore: [triggerRef] })
</script>

<template>
  <div class="relative shrink-0">
    <span ref="triggerRef" class="inline-flex">
      <Button
        variant="ghost"
        size="icon-sm"
        class="cursor-pointer"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        @click="open = !open"
      >
        <component :is="open ? XIcon : MenuIcon" class="w-4 h-4" />
      </Button>
    </span>

    <div
      v-if="open"
      ref="panelRef"
      class="fixed top-16 left-0 bottom-0 z-40 w-72 bg-[var(--color-surface)] border-r border-[var(--color-border-dark)] shadow-xl animate-in slide-in-from-left-4 fade-in duration-150"
    >
      <nav class="p-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm cursor-pointer transition-colors duration-200"
          active-class="bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
          :class="!$route.path.startsWith(item.to) && 'text-slate-300 hover:text-white hover:bg-white/5'"
          @click="go(item.to)"
        >
          <component :is="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>
