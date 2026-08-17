// app/plugins/google-translate.client.ts
// Loads Google's Website Translator widget once, globally, so every page —
// including the sidebar/navbar — gets auto-translated without maintaining
// per-string translation keys. useGoogleTranslate() drives it from the UI.

declare global {
  interface Window {
    google?: { translate?: { TranslateElement?: any } }
    googleTranslateElementInit?: () => void
  }
}

export default defineNuxtPlugin(() => {
  if (window.google?.translate?.TranslateElement) return

  window.googleTranslateElementInit = () => {
    new window.google!.translate!.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: 'en,fr,es',
        autoDisplay: false,
      },
      'google_translate_element',
    )
  }

  const script = document.createElement('script')
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.async = true
  document.head.appendChild(script)
})
