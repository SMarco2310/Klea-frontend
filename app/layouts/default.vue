<!-- app/layouts/default.vue -->
<template>
  <div class="relative min-h-screen bg-[var(--color-bg)]">
    <div class="bg-grid-pattern !fixed" aria-hidden="true" />
    <div class="relative z-[1]">
      <slot />
    </div>
  </div>
</template>
