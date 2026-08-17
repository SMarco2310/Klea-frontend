<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'

const { colorMode } = useTheme()
const toasterTheme = computed(() => colorMode.value === 'auto' ? 'system' : colorMode.value)

const { restoreSavedLanguage } = useGoogleTranslate()
onMounted(() => {
  restoreSavedLanguage()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster position="bottom-right" rich-colors :theme="toasterTheme" />

  <!-- Google's widget mounts its (hidden, see main.css) UI into this div. -->
  <div id="google_translate_element" class="hidden" />
</template>
