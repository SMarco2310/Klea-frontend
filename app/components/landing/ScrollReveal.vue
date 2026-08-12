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
      !isVisible && direction === 'up' && 'motion-safe:translate-y-12',
      !isVisible && direction === 'down' && 'motion-safe:-translate-y-12',
      !isVisible && direction === 'left' && 'motion-safe:translate-x-12',
      !isVisible && direction === 'right' && 'motion-safe:-translate-x-12',
      !isVisible && direction === 'fade' && 'motion-safe:scale-95',
    ]"
  >
    <slot />
  </div>
</template>
