<!-- app/components/landing/LandingNavbar.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MoonIcon, SunIcon, MonitorIcon, LanguagesIcon } from '@lucide/vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

const { isDark, toggleDark, colorMode } = useTheme()
const { setLanguage } = useGoogleTranslate()

function changeLanguage(lang: 'en' | 'fr' | 'es') {
  setLanguage(lang)
}

const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl"
    style="transition-property: all; transition-duration: var(--dur-base); transition-timing-function: var(--ease-spring-out)"
  >
    <nav
      class="flex items-center justify-between px-6 py-3.5 rounded-lg border relative overflow-hidden shadow-xl"
      style="transition-property: all; transition-duration: var(--dur-base); transition-timing-function: var(--ease-spring-out)"
      :class="
        isScrolled
          ? 'border-black/15 dark:border-white/15 bg-[color:var(--color-surface)]/70 backdrop-blur-xl shadow-lg'
          : 'border-black/10 dark:border-white/10 bg-[color:var(--color-surface)]/30 backdrop-blur-md shadow-md'
      "
    >
      <!-- Top subtle glass sheen line -->
      <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/20 dark:via-white/20 to-transparent pointer-events-none" />

      <!-- Brand Logo -->
      <NuxtLink to="/" class="notranslate font-heading font-bold text-xl tracking-tight text-foreground flex items-center cursor-pointer select-none">
        <span>Klea</span>
        <span class="text-[var(--color-accent)] font-extrabold text-2xl leading-none">.</span>
      </NuxtLink>

      <!-- Center Navigation Links -->
      <div class="hidden md:flex items-center gap-8 text-sm font-medium">
        <a href="#features" class="text-foreground opacity-70 hover:opacity-100 cursor-pointer transition-opacity duration-200">
          Features
        </a>
        <NuxtLink to="/docs" class="text-foreground opacity-70 hover:opacity-100 cursor-pointer transition-opacity duration-200">
          Docs
        </NuxtLink>
        <a href="#pricing" class="text-foreground opacity-70 hover:opacity-100 cursor-pointer transition-opacity duration-200">
          Pricing
        </a>
      </div>

      <!-- Right Action Buttons -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1 mr-2 hidden md:flex">
          <button
            class="text-foreground opacity-70 hover:opacity-100 cursor-pointer transition-colors flex items-center justify-center w-8 h-8 rounded-md hover:bg-foreground/5"
            @click="toggleDark()"
            aria-label="Toggle theme"
          >
            <ClientOnly>
              <MonitorIcon v-if="colorMode === 'auto'" class="w-4 h-4" />
              <MoonIcon v-else-if="colorMode === 'light'" class="w-4 h-4" />
              <SunIcon v-else class="w-4 h-4" />
              <template #fallback>
                <div class="w-4 h-4" />
              </template>
            </ClientOnly>
          </button>
  
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                class="text-foreground opacity-70 hover:opacity-100 cursor-pointer transition-colors flex items-center justify-center w-8 h-8 rounded-md hover:bg-foreground/5"
                aria-label="Change language"
              >
                <LanguagesIcon class="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-40 border-[var(--color-border-dark)] bg-[var(--color-surface)]/95 backdrop-blur-xl">
              <DropdownMenuItem class="cursor-pointer font-medium" @click="changeLanguage('en')">English (EN)</DropdownMenuItem>
              <DropdownMenuItem class="cursor-pointer" @click="changeLanguage('fr')">Français (FR)</DropdownMenuItem>
              <DropdownMenuItem class="cursor-pointer" @click="changeLanguage('es')">Español (ES)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <NuxtLink to="/login" class="text-sm font-medium text-foreground opacity-70 hover:opacity-100 cursor-pointer transition-opacity">
          Login
        </NuxtLink>
        <NuxtLink
          to="/signup"
          class="px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-all duration-200 active:scale-[0.97] active:duration-75 shadow-md shadow-emerald-950/40"
        >
          Get started
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>
