<script setup lang="ts">
const { workspace, fetchWorkspace } = useWorkspace()

// Ensure we have fetched the active workspace
await fetchWorkspace()

if (workspace.value.slug) {
  // We have a workspace, redirect to the tenant URL
  await navigateTo(`/${workspace.value.slug}/dashboard`, { redirectCode: 302 })
} else {
  // No workspace yet, go to onboarding
  await navigateTo('/onboarding', { redirectCode: 302 })
}
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
    <div class="animate-pulse flex items-center gap-2 text-slate-500">
      <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
      <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
    </div>
  </div>
</template>
