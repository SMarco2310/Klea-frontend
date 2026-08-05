<!-- app/components/landing/ScrollReveal.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    delay?: number
    duration?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  }>(),
  {
    delay: 0,
    duration: 500,
    direction: 'up',
  }
)

const target = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const prefersReducedMotion = ref(false)
if (typeof window !== 'undefined' && window.matchMedia) {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const clampedDuration = computed(() => Math.min(props.duration, 500))

useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    if (isIntersecting) {
      isVisible.value = true
      observerElement.disconnect()
    }
  },
  { threshold: 0.1 }
)
</script>

<template>
  <div
    ref="target"
    style="transition-property: opacity, transform; transition-timing-function: var(--ease-spring-out)"
    :style="{
      transitionDuration: `${clampedDuration}ms`,
      transitionDelay: `${delay}ms`,
    }"
    :class="[
      isVisible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : 'opacity-0 pointer-events-none',
      !prefersReducedMotion && !isVisible && direction === 'up' && 'translate-y-12',
      !prefersReducedMotion && !isVisible && direction === 'down' && '-translate-y-12',
      !prefersReducedMotion && !isVisible && direction === 'left' && 'translate-x-12',
      !prefersReducedMotion && !isVisible && direction === 'right' && '-translate-x-12',
      !prefersReducedMotion && !isVisible && direction === 'fade' && 'scale-95',
    ]"
  >
    <slot />
  </div>
</template>
