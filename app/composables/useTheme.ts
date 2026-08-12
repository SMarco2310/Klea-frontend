// app/composables/useTheme.ts
import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'

export function useTheme() {
  // Matches the inline script in nuxt.config.ts's app.head.script
  const colorMode = useColorMode({ 
    storageKey: 'klea-color-mode', 
    initialValue: 'auto',
    emitAuto: true
  })
  
  // For backwards compatibility and logic that explicitly checks for dark
  const isDark = computed(() => {
    if (colorMode.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return colorMode.value === 'dark'
  })
  
  // Cycle through themes: auto -> light -> dark -> auto
  const toggleDark = () => {
    if (colorMode.value === 'auto') colorMode.value = 'light'
    else if (colorMode.value === 'light') colorMode.value = 'dark'
    else colorMode.value = 'auto'
  }

  return { isDark, toggleDark, colorMode }
}
