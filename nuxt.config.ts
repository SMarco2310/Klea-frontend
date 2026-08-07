import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@clerk/nuxt', 'nuxt-shiki', 'nuxt-charts'],
  shiki: {
    defaultTheme: 'github-dark',
  },
  clerk: {
    // Clerk is only used client-side to broker Google/GitHub OAuth identity,
    // then exchanged for a real session via the Laravel API. There is no
    // server-side use of Clerk here, so its server middleware (which
    // otherwise requires a secret key) is disabled.
    skipServerMiddleware: true,
  },
  css: ['~/assets/css/main.css'],
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
      htmlAttrs: { class: 'dark' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
        },
      ],
    },
  },
})
