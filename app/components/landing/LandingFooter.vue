<!-- app/components/landing/LandingFooter.vue -->
<template>
  <footer class="relative px-6 py-8">
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-border)] to-transparent" aria-hidden="true" />
    <div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
      <span class="font-mono text-xs">© 2026 <span class="notranslate">Klea</span><span class="text-[var(--color-accent)]">.</span></span>
      <div class="flex gap-4">
        <NuxtLink to="/docs" class="hover:text-foreground cursor-pointer">Docs</NuxtLink>
        <NuxtLink to="/login" class="hover:text-foreground cursor-pointer">Login</NuxtLink>
        <NuxtLink to="/signup" class="hover:text-foreground cursor-pointer">Signup</NuxtLink>
      </div>
    </div>
  </footer>
</template>
