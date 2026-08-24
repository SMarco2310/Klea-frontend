// app/composables/useLocale.ts
// Replaces useGoogleTranslate. Same shape of API so the two navbars need
// only a mechanical swap, but this sets the i18n locale instead of driving
// Google's hidden <select>.
export function useLocale() {
  const { locale, locales, setLocale } = useI18n()

  const availableLocales = computed(() =>
    (locales.value as Array<{ code: string; name: string }>).map((l) => ({
      code: l.code,
      name: l.name,
    })),
  )

  return { locale, availableLocales, setLocale }
}
