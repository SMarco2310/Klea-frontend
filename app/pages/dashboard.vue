<script setup lang="ts">
import { Button } from '~/components/ui/button'
const { workspace, fetchWorkspace } = useWorkspace()

// Ensure we have fetched the active workspace
await fetchWorkspace()

if (workspace.value.slug) {
  // We have a workspace, redirect to the tenant URL
  await navigateTo(`/${workspace.value.slug}/dashboard`, { redirectCode: 302 })
}
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
    <div v-if="!workspace.slug" class="text-center p-6 bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-xl shadow-xl max-w-sm mx-auto">
      <h2 class="font-heading text-xl font-semibold mb-2">No Workspace Found</h2>
      <p class="text-muted-foreground text-sm mb-6">You don't belong to any workspaces yet. You can create a new one to get started.</p>
      <NuxtLink to="/onboarding">
        <Button class="w-full cursor-pointer bg-[var(--color-accent)] text-white hover:opacity-90">Create Workspace</Button>
      </NuxtLink>
    </div>
    <div v-else class="animate-pulse flex items-center gap-2 text-slate-500">
      <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
      <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
    </div>
  </div>
</template>
