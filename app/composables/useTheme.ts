// app/composables/useTheme.ts
import { useDark, useToggle } from '@vueuse/core'

export function useTheme() {
  // Matches the inline script in nuxt.config.ts's app.head.script, which
  // sets the class before hydration to avoid a flash of the wrong theme.
  const isDark = useDark({ storageKey: 'klea-color-mode', initialValue: 'dark' })
  const toggleDark = useToggle(isDark)
  return { isDark, toggleDark }
}
