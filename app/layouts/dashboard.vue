<!-- app/layouts/dashboard.vue -->
<script setup lang="ts">
import TheNavbar from '~/components/layout/TheNavbar.vue'
import TheEnvBanner from '~/components/layout/TheEnvBanner.vue'

const { apps, fetchApps } = useApps()
if (apps.value.length === 0) {
  fetchApps()
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg)] text-slate-50">
    <TheNavbar />
    <TheEnvBanner />
    <main class="px-6 py-8 max-w-7xl mx-auto">
      <slot />
    </main>
  </div>
</template>
