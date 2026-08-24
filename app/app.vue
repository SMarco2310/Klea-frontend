<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'

const { colorMode } = useTheme()
const toasterTheme = computed(() => colorMode.value === 'auto' ? 'system' : colorMode.value)
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster position="bottom-right" rich-colors :theme="toasterTheme" />
</template>
