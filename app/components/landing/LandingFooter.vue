<!-- app/components/landing/LandingFooter.vue -->
<template>
  <footer class="border-t border-[var(--color-border-dark)] px-6 py-8">
    <div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-400">
      <span class="font-mono text-xs">© 2026 Klea</span>
      <div class="flex gap-4">
        <NuxtLink to="/docs" class="hover:text-white cursor-pointer">Docs</NuxtLink>
        <NuxtLink to="/login" class="hover:text-white cursor-pointer">Login</NuxtLink>
        <NuxtLink to="/signup" class="hover:text-white cursor-pointer">Signup</NuxtLink>
      </div>
    </div>
  </footer>
</template>
