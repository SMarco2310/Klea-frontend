# Laravel + Clerk Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Klea's mock authentication with real Laravel Sanctum auth (email+password) plus Clerk-brokered Google/GitHub OAuth that exchanges for a Laravel Bearer token, per `docs/superpowers/specs/2026-08-03-clerk-auth-design.md`.

**Architecture:** `useAuth()` composable talks directly to the existing Laravel API (`/api/login`, `/api/register`, `/api/auth/clerk`, `/api/me`, `/api/logout`) and stores the returned Bearer token in a cookie. `@clerk/nuxt` is installed solely to get a Google/GitHub identity JWT client-side (`useSignIn().sso()` + Clerk's `useAuth().getToken()`); Clerk's own session state is never read anywhere else in the app. A new `/sso-callback` page bridges the two: it takes Clerk's JWT and forwards it to this app's `useAuth().loginWithClerkToken()`, which calls `/api/auth/clerk` and stores the real Laravel token.

**Tech Stack:** Nuxt 4, `@clerk/nuxt` (OAuth broker only), Laravel Sanctum backend (external, already built, contract fixed), `useCookie` for token persistence.

## Global Constraints

- Laravel is the only session owner. Clerk's `setActive`/`isSignedIn`/session APIs are never used to gate the app — only this app's own `useAuth().isSignedIn` (derived from the stored Laravel token) gates routes.
- Base API URL: `http://localhost:8000`, read from `NUXT_PUBLIC_API_BASE_URL` (spec §Existing backend contract).
- Existing Laravel endpoint contract is fixed and external — do not modify assumptions about its request/response shapes (spec table: `/api/register`, `/api/login`, `/api/logout`, `/api/me`, `/api/auth/clerk`).
- Token delivery is Bearer, not cookie-session on the Laravel side — the frontend stores the returned `plainTextToken` itself and sends `Authorization: Bearer <token>` on `/api/me` and `/api/logout` (spec §Existing backend contract).
- Login/signup UI is stacked on one screen (email/password form, divider, then Google/GitHub buttons) — not tabs (spec §Pages).
- None of the 11 existing dashboard pages change — `app/middleware/auth.ts` keeps the same file path and `middleware: 'auth'` call-site, only its body changes (spec §Pages, §What gets added).
- No emoji icons, `cursor-pointer` on all interactive elements, visible focus states, 150–300ms transitions — same project-wide rules as the rest of the app (established in earlier Klea specs, still binding).
- No Laravel-side changes, no Clerk Dashboard configuration — both are fixed externals for this pass (spec §Explicit non-goals).
- No wiring of `useWorkspace`/`useApps`/etc. to real tenant data in this pass — only auth becomes real (spec §Explicit non-goals).

---

## File Structure

```
app/
  composables/
    useAuth.ts                — REWRITE: real Laravel-backed auth (login/register/loginWithClerkToken/fetchCurrentUser/logout), token in a cookie
  pages/
    login.vue                 — REWRITE: stacked email/password form + Google/GitHub OAuth buttons
    signup.vue                 — REWRITE: stacked name/email/password form + Google/GitHub OAuth buttons
    sso-callback.vue           — NEW: bridges Clerk's JWT to Laravel's /api/auth/clerk
  middleware/
    auth.ts                    — REWRITE: same call-site, checks this app's useAuth().isSignedIn instead of the mock
  components/layout/
    TheNavbar.vue              — MODIFY: logout handler awaits the now-async logout()
nuxt.config.ts                 — MODIFY: add @clerk/nuxt module, runtimeConfig.public.apiBaseUrl
.env.example                   — NEW: placeholder Clerk publishable key + API base URL
package.json                   — MODIFY: add @clerk/nuxt dependency
```

No changes to: `app/pages/team.vue` (already reads `.name`/`.email`, which matches Laravel's shape), any of the 11 dashboard/app-detail pages, any other composable.

---

## Task 1: Install @clerk/nuxt, configure env vars and runtime config

**Files:**
- Modify: `nuxt.config.ts`
- Create: `.env.example`
- Modify: `package.json` (via npm install)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: `useRuntimeConfig().public.apiBaseUrl` (string, defaults to `http://localhost:8000`) and `useRuntimeConfig().public.clerkPublishableKey` available to later tasks; `@clerk/nuxt`'s composables (`useSignIn`, `useAuth` under alias) importable from `#imports` per the module's auto-registration.

- [ ] **Step 1: Install @clerk/nuxt**

```bash
npm install @clerk/nuxt
```

- [ ] **Step 2: Create `.env.example`**

```bash
# Clerk (OAuth broker only — Google/GitHub sign-in). Get from https://dashboard.clerk.com -> API Keys.
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# Laravel API base URL
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

- [ ] **Step 3: Update `nuxt.config.ts`**

```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@clerk/nuxt'],
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
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&display=swap',
        },
      ],
    },
  },
})
```

- [ ] **Step 4: Create a local `.env` from the example (gitignored) with placeholder values so the dev server boots**

```bash
cp .env.example .env
```

- [ ] **Step 5: Verify the dev server boots with the module installed**

Run: `npm run dev`
Expected: server starts without throwing on the missing/placeholder Clerk key at boot time (the `@clerk/nuxt` module should not crash the whole app just because the key is a placeholder — if it does, note this in the task report as a concern, since real verification needs a real key anyway). Check `/tmp` dev log or terminal output for module registration confirmation (e.g. a line mentioning Clerk).

- [ ] **Step 6: Run production build to confirm no config errors**

Run: `npm run build`
Expected: build completes successfully.

- [ ] **Step 7: Commit**

```bash
git add nuxt.config.ts .env.example package.json package-lock.json
git commit -m "chore: add @clerk/nuxt module and API base URL runtime config"
```

---

## Task 2: Rewrite useAuth() composable for real Laravel backend

**Files:**
- Modify: `app/composables/useAuth.ts`

**Interfaces:**
- Consumes: `useRuntimeConfig().public.apiBaseUrl` (Task 1), Nuxt's built-in `useCookie` and `$fetch`
- Produces (exact signatures every later task relies on):

```typescript
interface LaravelUser {
  id: number
  name: string
  email: string
  current_tenant_id: number | null
}

function useAuth(): {
  user: Ref<LaravelUser | null>
  isSignedIn: ComputedRef<boolean>
  login: (email: string, password: string) => Promise<void>       // throws on failure (Laravel's error message on .data.message or caught error)
  register: (name: string, email: string, password: string) => Promise<void>  // throws on failure
  loginWithClerkToken: (sessionToken: string) => Promise<void>     // throws on failure
  fetchCurrentUser: () => Promise<void>                            // no-op if no token; does not throw
  logout: () => Promise<void>                                      // always clears local state even if the API call fails
}
```

- [ ] **Step 1: Write the failing expectations as a quick manual check plan (no test framework configured in this project — see Global Constraints/spec's testing approach)**

Since there's no test framework, this task is verified by a temporary scratch check instead of automated tests (same pattern used throughout the Klea build). Write the implementation first, then verify via Steps 4-5 below.

- [ ] **Step 2: Write `app/composables/useAuth.ts`**

```typescript
// app/composables/useAuth.ts
interface LaravelUser {
  id: number
  name: string
  email: string
  current_tenant_id: number | null
}

interface AuthResponse {
  data: {
    user: LaravelUser
    token: string
  }
  success: boolean
  message: string
}

const user = ref<LaravelUser | null>(null)

export function useAuth() {
  const token = useCookie<string | null>('auth_token', { default: () => null })
  const config = useRuntimeConfig()

  const isSignedIn = computed(() => !!token.value)

  function authHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  async function login(email: string, password: string) {
    const res = await $fetch<AuthResponse>(`${config.public.apiBaseUrl}/api/login`, {
      method: 'POST',
      body: { email, password },
    })
    token.value = res.data.token
    user.value = res.data.user
  }

  async function register(name: string, email: string, password: string) {
    const res = await $fetch<AuthResponse>(`${config.public.apiBaseUrl}/api/register`, {
      method: 'POST',
      body: { name, email, password },
    })
    token.value = res.data.token
    user.value = res.data.user
  }

  async function loginWithClerkToken(sessionToken: string) {
    const res = await $fetch<AuthResponse>(`${config.public.apiBaseUrl}/api/auth/clerk`, {
      method: 'POST',
      body: { session_token: sessionToken },
    })
    token.value = res.data.token
    user.value = res.data.user
  }

  async function fetchCurrentUser() {
    if (!token.value) return
    user.value = await $fetch<LaravelUser>(`${config.public.apiBaseUrl}/api/me`, {
      headers: authHeaders(),
    })
  }

  async function logout() {
    if (token.value) {
      await $fetch(`${config.public.apiBaseUrl}/api/logout`, {
        method: 'POST',
        headers: authHeaders(),
      }).catch(() => {})
    }
    token.value = null
    user.value = null
  }

  return { user, isSignedIn, login, register, loginWithClerkToken, fetchCurrentUser, logout }
}
```

- [ ] **Step 3: Extract Laravel's error message on failure — add a small helper used by pages, not the composable itself**

Create the error-extraction as a plain function in the same file (keeps pages simple):

```typescript
// append to app/composables/useAuth.ts
export function extractAuthErrorMessage(err: unknown): string {
  const fetchError = err as { data?: { message?: string } }
  return fetchError?.data?.message || 'Something went wrong. Please try again.'
}
```

- [ ] **Step 4: Manual verification — mock server check**

If a real Laravel instance is reachable at `http://localhost:8000` (per the plan's non-goals, this is optional but do it if available): temporarily add to `app/pages/index.vue` (revert after):

```vue
<script setup lang="ts">
const { login, user } = useAuth()
async function test() {
  try {
    await login('test@example.com', 'wrongpassword')
  } catch (e) {
    console.log('expected error:', e)
  }
}
</script>
<template><button @click="test">test login</button></template>
```

Run `npm run dev`, click the button, confirm a 422 error is caught and logged (not an uncaught exception). Revert this temporary edit — `index.vue` must return to its committed landing-page content.

If no reachable Laravel instance: skip live verification, but run `npm run build` to confirm the composable itself has no type/syntax errors, and note in the task report that live login was not verifiable in this environment.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useAuth.ts
git commit -m "feat: rewrite useAuth to call the real Laravel API instead of mock state"
```

---

## Task 3: Rewrite login.vue and signup.vue with stacked email + OAuth UI

**Files:**
- Modify: `app/pages/login.vue`
- Modify: `app/pages/signup.vue`

**Interfaces:**
- Consumes: `useAuth()` (Task 2) — `login`, `register`, `extractAuthErrorMessage`; Clerk's `useSignIn()` from `@clerk/nuxt` (Task 1); existing shadcn `Input`/`Label`/`Button` (already installed)
- Produces: nothing further downstream (leaf pages), but establishes the "or continue with" divider pattern used identically on both pages

- [ ] **Step 1: Write `login.vue`**

```vue
<!-- app/pages/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useSignIn } from '@clerk/nuxt'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const { login, extractAuthErrorMessage } = useAuth()
const { signIn, isLoaded } = useSignIn()

async function handleSubmit() {
  if (!email.value || !password.value) return
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch (e) {
    errorMessage.value = extractAuthErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}

async function handleOAuth(strategy: 'oauth_google' | 'oauth_github') {
  if (!isLoaded.value || !signIn.value) return
  errorMessage.value = ''
  try {
    await signIn.value.sso({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/sso-callback',
    })
  } catch (e) {
    errorMessage.value = 'Could not start sign-in. Please try again.'
  }
}
</script>

<template>
  <div class="bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-xl p-8">
    <h1 class="font-heading text-2xl font-semibold mb-1">Welcome back</h1>
    <p class="text-slate-400 text-sm mb-6">Log in to your Klea workspace</p>

    <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" v-model="email" type="email" placeholder="you@example.com" required />
      </div>
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input id="password" v-model="password" type="password" placeholder="••••••••" required />
      </div>
      <Button type="submit" class="w-full cursor-pointer" :disabled="isSubmitting">
        {{ isSubmitting ? 'Logging in...' : 'Log in' }}
      </Button>
    </form>

    <div class="flex items-center gap-3 my-6">
      <div class="h-px bg-[var(--color-border-dark)] flex-1" />
      <span class="text-xs text-slate-500">or continue with</span>
      <div class="h-px bg-[var(--color-border-dark)] flex-1" />
    </div>

    <div class="space-y-2">
      <Button variant="secondary" class="w-full cursor-pointer" @click="handleOAuth('oauth_google')">
        Continue with Google
      </Button>
      <Button variant="secondary" class="w-full cursor-pointer" @click="handleOAuth('oauth_github')">
        Continue with GitHub
      </Button>
    </div>

    <p class="text-sm text-slate-400 mt-6 text-center">
      No account?
      <NuxtLink to="/signup" class="text-[var(--color-accent)] cursor-pointer">Sign up</NuxtLink>
    </p>
  </div>
</template>
```

- [ ] **Step 2: Write `signup.vue`**

```vue
<!-- app/pages/signup.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useSignIn } from '@clerk/nuxt'

const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const { register, extractAuthErrorMessage } = useAuth()
const { signIn, isLoaded } = useSignIn()

async function handleSubmit() {
  if (!name.value || !email.value || !password.value) return
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await register(name.value, email.value, password.value)
    await navigateTo('/dashboard')
  } catch (e) {
    errorMessage.value = extractAuthErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}

async function handleOAuth(strategy: 'oauth_google' | 'oauth_github') {
  if (!isLoaded.value || !signIn.value) return
  errorMessage.value = ''
  try {
    await signIn.value.sso({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/sso-callback',
    })
  } catch (e) {
    errorMessage.value = 'Could not start sign-up. Please try again.'
  }
}
</script>

<template>
  <div class="bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-xl p-8">
    <h1 class="font-heading text-2xl font-semibold mb-1">Create your account</h1>
    <p class="text-slate-400 text-sm mb-6">Start issuing licenses in minutes</p>

    <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="name">Full name</Label>
        <Input id="name" v-model="name" placeholder="Ada Lovelace" required />
      </div>
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" v-model="email" type="email" placeholder="you@example.com" required />
      </div>
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input id="password" v-model="password" type="password" placeholder="••••••••" required />
      </div>
      <Button type="submit" class="w-full cursor-pointer" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating account...' : 'Create account' }}
      </Button>
    </form>

    <div class="flex items-center gap-3 my-6">
      <div class="h-px bg-[var(--color-border-dark)] flex-1" />
      <span class="text-xs text-slate-500">or continue with</span>
      <div class="h-px bg-[var(--color-border-dark)] flex-1" />
    </div>

    <div class="space-y-2">
      <Button variant="secondary" class="w-full cursor-pointer" @click="handleOAuth('oauth_google')">
        Continue with Google
      </Button>
      <Button variant="secondary" class="w-full cursor-pointer" @click="handleOAuth('oauth_github')">
        Continue with GitHub
      </Button>
    </div>

    <p class="text-sm text-slate-400 mt-6 text-center">
      Already have an account?
      <NuxtLink to="/login" class="text-[var(--color-accent)] cursor-pointer">Log in</NuxtLink>
    </p>
  </div>
</template>
```

- [ ] **Step 3: Verify Clerk's `useSignIn()` import path and property names against the actually-installed package**

Run: `grep -r "useSignIn" node_modules/@clerk/nuxt/dist/*.d.ts 2>/dev/null | head -5` (or equivalent — inspect the installed package's type definitions) to confirm `useSignIn()` returns `{ signIn, isLoaded }` where `signIn` is a `Ref` with an `.sso()` method, matching what Steps 1-2 assume. If the actual shape differs (e.g. `signIn` is not ref-wrapped, or the method is named differently), adjust both files to match the real installed API and note the discrepancy in the task report.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/login`.
Expected: form renders, divider renders, two OAuth buttons render, no console errors on page load (a Clerk-not-configured warning is acceptable given the placeholder key — note if it's a hard crash instead of a warning, that's a real problem to fix). Fill in email/password with any values and submit — expect either a real API error (if Laravel is reachable) surfaced inline, or a network-error message (if Laravel is not reachable) — either is acceptable for this step, but confirm the page does not crash. Repeat for `/signup`.

Resize to 375px — confirm no horizontal overflow on either page (matches project-wide responsive rule).

- [ ] **Step 5: Commit**

```bash
git add app/pages/login.vue app/pages/signup.vue
git commit -m "feat: rewrite login/signup with stacked email+password and OAuth options"
```

---

## Task 4: sso-callback page and auth middleware rewrite

**Files:**
- Create: `app/pages/sso-callback.vue`
- Modify: `app/middleware/auth.ts`

**Interfaces:**
- Consumes: `useAuth()` (Task 2) — `loginWithClerkToken`, `isSignedIn`, `fetchCurrentUser`, `user`; Clerk's `useAuth` (aliased) from `@clerk/nuxt` for `getToken()`
- Produces: nothing further downstream

- [ ] **Step 1: Write `sso-callback.vue`**

```vue
<!-- app/pages/sso-callback.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'default' })
import { useAuth as useClerkAuth } from '@clerk/nuxt'

const { loginWithClerkToken } = useAuth()
const { getToken, isLoaded } = useClerkAuth()
const errorMessage = ref('')

async function exchangeToken() {
  const clerkToken = await getToken.value()
  if (!clerkToken) {
    errorMessage.value = 'Sign-in did not complete. Please try again.'
    return
  }
  try {
    await loginWithClerkToken(clerkToken)
    await navigateTo('/dashboard')
  } catch (e) {
    errorMessage.value = 'Could not complete sign-in with our server. Please try again.'
  }
}

watchEffect(() => {
  if (isLoaded.value) {
    exchangeToken()
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center">
      <p v-if="!errorMessage" class="text-slate-400">Completing sign-in...</p>
      <div v-else class="space-y-4">
        <p class="text-sm text-red-400">{{ errorMessage }}</p>
        <NuxtLink to="/login" class="text-[var(--color-accent)] cursor-pointer text-sm">
          Back to login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify Clerk's `useAuth()` (aliased `useClerkAuth`) shape against the installed package**

Run: inspect `node_modules/@clerk/nuxt/dist/*.d.ts` (or the package's Vue-SDK type defs it re-exports) for `useAuth`'s return shape — confirm `getToken` is a `Ref` wrapping a callable function (`getToken.value()`), and `isLoaded` is a `Ref<boolean>`. If the actual shape differs (e.g. `getToken` is called directly without `.value`, or is async in a different way), adjust Step 1's code to match and note the discrepancy in the task report.

- [ ] **Step 3: Rewrite `app/middleware/auth.ts`**

```typescript
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(async () => {
  const { isSignedIn, fetchCurrentUser, user } = useAuth()
  if (!isSignedIn.value) {
    return navigateTo('/login')
  }
  if (!user.value) {
    await fetchCurrentUser()
  }
})
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/sso-callback` directly (without a real Clerk session).
Expected: page renders the "Completing sign-in..." state, then (since there's no real Clerk session in this direct-navigation test) either shows the "did not complete" error message or silently does nothing further — confirm no uncaught exception, no blank white crash screen.

Then test the middleware: with no token cookie set, navigate to `http://localhost:3000/dashboard` directly — expect a redirect to `/login`. If a real Laravel instance and test user are reachable, log in via the email/password form (Task 3), confirm landing on `/dashboard` without a redirect loop, then refresh the page — expect to stay on `/dashboard` (token cookie persists) and `user` to repopulate via `/api/me`.

- [ ] **Step 5: Commit**

```bash
git add app/pages/sso-callback.vue app/middleware/auth.ts
git commit -m "feat: add Clerk-to-Laravel SSO callback and real auth middleware"
```

---

## Task 5: Update TheNavbar's logout call site

**Files:**
- Modify: `app/components/layout/TheNavbar.vue`

**Interfaces:**
- Consumes: `useAuth()` (Task 2) — `logout` is now async
- Produces: nothing further downstream

- [ ] **Step 1: Update `handleLogout` to await the now-async `logout()`**

In `app/components/layout/TheNavbar.vue`, find:

```typescript
function handleLogout() {
  logout()
  navigateTo('/login')
}
```

Replace with:

```typescript
async function handleLogout() {
  await logout()
  navigateTo('/login')
}
```

No other changes needed in this file — `user.value?.name` and `user.value?.email` reads already match Laravel's `User` shape (`name`, `email` fields), confirmed against the current file content before writing this plan.

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, log in (if a reachable Laravel test instance is available), click the avatar menu, click "Log out". Expected: redirected to `/login`, and revisiting `/dashboard` directly redirects back to `/login` (session actually cleared, not just UI state).

If no reachable Laravel instance: verify by reading the diff only — confirm `await` was added correctly — and note in the report that live logout was not verified.

- [ ] **Step 3: Commit**

```bash
git add app/components/layout/TheNavbar.vue
git commit -m "fix: await async logout in TheNavbar before redirecting"
```

---

## Task 6: Final verification pass

**Files:**
- Modify: any file flagged during this pass (exact files depend on findings)

**Interfaces:**
- Consumes: everything built in Tasks 1–5
- Produces: nothing (verification-only task)

- [ ] **Step 1: Full route walk**

Run: `npm run dev`. Visit `/login`, `/signup`, `/sso-callback` (direct nav, expect graceful "did not complete" state, not a crash). Confirm no console errors on any of the three, no emoji icons, `cursor-pointer` present on every button/link, focus states visible when tabbing through the login form.

- [ ] **Step 2: Responsive check**

Resize `/login` and `/signup` to 375px, 768px, 1024px, 1440px — confirm no horizontal overflow at any width (same check pattern as the rest of the app).

- [ ] **Step 3: Production build**

Run: `npm run build` — confirm it completes with no errors.

- [ ] **Step 4: Document the real-world testing gap explicitly**

Since a real Clerk publishable key and (possibly) a reachable Laravel instance may not both be available during this implementation, write a short note (as part of the final commit message, not a separate file) listing exactly what was and wasn't verified live: which of email/password login, register, logout, and the Clerk OAuth round-trip were exercised against real backends versus only checked for "doesn't crash, sends the right shape of request."

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: final verification pass for Laravel+Clerk auth integration"
```
