<!-- app/layouts/default.vue -->
<template>
  <div class="relative min-h-screen bg-[var(--color-bg)] text-slate-50">
    <div class="ambient-mesh" aria-hidden="true" />
    <div class="relative z-[1]">
      <slot />
    </div>
  </div>
</template>
