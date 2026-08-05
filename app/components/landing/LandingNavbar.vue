<!-- app/components/landing/LandingNavbar.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
  <header class="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl transition-all duration-300">
    <nav
      class="flex items-center justify-between px-6 py-3.5 rounded-lg border transition-all duration-300 relative overflow-hidden shadow-xl"
      :class="
        isScrolled
          ? 'border-white/15 bg-zinc-900/70 backdrop-blur-xl shadow-black/60'
          : 'border-white/10 bg-white/[0.06] backdrop-blur-md shadow-black/40'
      "
    >
      <!-- Top subtle glass sheen line -->
      <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      <!-- Brand Logo -->
      <NuxtLink to="/" class="font-heading font-bold text-xl tracking-tight text-white flex items-center cursor-pointer select-none">
        <span>Klea</span>
        <span class="text-[var(--color-accent)] font-extrabold text-2xl leading-none">.</span>
      </NuxtLink>

      <!-- Center Navigation Links -->
      <div class="hidden md:flex items-center gap-8 text-sm font-medium">
        <a href="#features" class="text-slate-300 hover:text-white cursor-pointer transition-colors duration-200">
          Features
        </a>
        <NuxtLink to="/docs" class="text-slate-300 hover:text-white cursor-pointer transition-colors duration-200">
          Docs
        </NuxtLink>
        <a href="#pricing" class="text-slate-300 hover:text-white cursor-pointer transition-colors duration-200">
          Pricing
        </a>
      </div>

      <!-- Right Action Buttons -->
      <div class="flex items-center gap-4">
        <NuxtLink to="/login" class="text-sm font-medium text-slate-300 hover:text-white cursor-pointer transition-colors">
          Login
        </NuxtLink>
        <NuxtLink
          to="/signup"
          class="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--color-accent)] text-slate-950 hover:bg-[var(--color-accent)]/90 cursor-pointer transition-all duration-200 shadow-md shadow-emerald-950/40"
        >
          Get started
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>
