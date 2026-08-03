<!-- app/components/landing/LandingNavbar.vue -->
<script setup lang="ts">
import { Button } from '~/components/ui/button'
</script>

<template>
  <nav class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
    <span class="font-heading font-semibold text-lg">Klea</span>
    <div class="hidden md:flex items-center gap-6 text-sm text-slate-400">
      <a href="#features" class="hover:text-white cursor-pointer transition-colors duration-200">Features</a>
      <NuxtLink to="/docs" class="hover:text-white cursor-pointer transition-colors duration-200">Docs</NuxtLink>
      <a href="#pricing" class="hover:text-white cursor-pointer transition-colors duration-200">Pricing</a>
    </div>
    <div class="flex items-center gap-3">
      <NuxtLink to="/login" class="text-sm text-slate-300 hover:text-white cursor-pointer">Login</NuxtLink>
      <Button as-child class="cursor-pointer">
        <NuxtLink to="/signup">Get started</NuxtLink>
      </Button>
    </div>
  </nav>
</template>
