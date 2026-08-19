import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Language switching is handled by Google's Website Translator widget
  // (app/plugins/google-translate.client.ts + useGoogleTranslate), not
  // @nuxtjs/i18n — that only ever covered navbar strings, never the
  // sidebar or page content, and running both would fight each other.
  modules: ['@clerk/nuxt', 'nuxt-shiki', 'nuxt-charts'],
  shiki: {
    defaultTheme: 'vitesse-dark',
    // nuxt-shiki only bundles languages listed here — nothing lazy-loads on
    // demand, so every lang= used anywhere in the app (CodeBlock/LanguageTabs
    // usages, docs.vue's multi-language samples) must be listed explicitly
    // or highlighting 500s at render time.
    bundledLangs: ['typescript', 'tsx', 'javascript', 'bash', 'php', 'python', 'java', 'json'],
  },
  // Clerk is used client-side to broker Google/GitHub OAuth identity, then
  // exchanged for a real session via the Laravel API — we don't use Clerk's
  // server-side auth/session helpers ourselves. Its server middleware still
  // needs to run, though: on a *.clerk.accounts.dev dev instance it's what
  // completes the "dev browser" cookie handshake that authenticateWithRedirect
  // requires. Skipping it makes every OAuth sign-in 400 with
  // dev_browser_unauthenticated before it can even redirect to the provider.
  // vue-sonner ships its own stylesheet; without it toasts render unpositioned
  // (full width, below the fold) instead of floating in the corner.
  css: ['~/assets/css/main.css', 'vue-sonner/style.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      clerkPublishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    },
  },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
        },
      ],
      // Sets the .dark class before Vue hydrates so there's no flash of the
      // wrong theme — useTheme.ts picks up the same storage key
      // once the client takes over.
      script: [
        {
          innerHTML: `(function(){try{var m=localStorage.getItem('klea-color-mode')||'auto';var d=m==='dark'||(m==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
        },
      ],
    },
  },
})
