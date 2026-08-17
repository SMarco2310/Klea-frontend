// app/composables/useGoogleTranslate.ts
// Drives Google's Website Translator widget from our own UI. The widget
// renders a hidden <select id="google_translate_element_select"> once
// initialized — Google's own documented way to switch languages
// programmatically is to set that select's value and dispatch a change
// event, since there's no public JS API for it.

const STORAGE_KEY = 'klea_translate_lang'

export function useGoogleTranslate() {
  const currentLang = useState<string>('google-translate-lang', () => 'en')

  function findWidgetSelect(): HTMLSelectElement | null {
    return document.querySelector<HTMLSelectElement>('.goog-te-combo')
  }

  function setLanguage(lang: 'en' | 'fr' | 'es') {
    // "en" (the page's own language) has no entry in Google's combo box —
    // selecting it means restoring the original untranslated text.
    if (lang === 'en') {
      restoreOriginal()
      currentLang.value = 'en'
      localStorage.setItem(STORAGE_KEY, 'en')
      return
    }

    const select = findWidgetSelect()
    if (!select) return

    select.value = lang
    select.dispatchEvent(new Event('change'))
    currentLang.value = lang
    localStorage.setItem(STORAGE_KEY, lang)
  }

  function restoreOriginal() {
    // Clearing Google's translation cookie and reloading is the reliable way
    // to undo a translation — the widget doesn't expose a clean "reset" call.
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
    window.location.reload()
  }

  function restoreSavedLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved || saved === 'en') return
    // The widget needs a moment after the plugin's script loads before
    // .goog-te-combo exists in the DOM.
    const tryApply = (attemptsLeft: number) => {
      const select = findWidgetSelect()
      if (select) {
        select.value = saved
        select.dispatchEvent(new Event('change'))
        currentLang.value = saved
      } else if (attemptsLeft > 0) {
        setTimeout(() => tryApply(attemptsLeft - 1), 300)
      }
    }
    tryApply(15)
  }

  return { currentLang, setLanguage, restoreSavedLanguage }
}
