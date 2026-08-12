<!-- app/layouts/dashboard.vue -->
<script setup lang="ts">
import TheNavbar from '~/components/layout/TheNavbar.vue'
import TheEnvBanner from '~/components/layout/TheEnvBanner.vue'
import TheSidebar from '~/components/layout/TheSidebar.vue'

const { apps, fetchApps } = useApps()
if (apps.value.length === 0) {
  fetchApps()
}

const { fetchWorkspace } = useWorkspace()
fetchWorkspace()

const { isSidebarOpen } = useSidebar()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[var(--color-surface)]">
    <ClientOnly>
      <TheNavbar />
    </ClientOnly>
    <div class="flex flex-1 min-h-0">
      <TheSidebar v-if="isSidebarOpen" />
      <div class="flex-1 mx-1.5 mb-1.5 min-w-0 overflow-y-auto bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border-dark)] flex flex-col relative">
        <div class="bg-grid-pattern" aria-hidden="true" />
        <div class="relative z-[1] flex flex-col flex-1 w-full">
          <div class="overflow-hidden rounded-t-2xl shrink-0">
            <TheEnvBanner />
          </div>
          <main class="px-6 py-8 max-w-7xl mx-auto flex-1 w-full">
            <slot />
          </main>
        </div>
      </div>
    </div>
  </div>
</template>
