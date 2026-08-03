# Laravel + Clerk Authentication: Design Spec

Date: 2026-08-03
Status: Approved

## Summary

Replace Klea's mock in-memory authentication (`useAuth` composable, custom `/login` and `/signup` pages, `auth.ts` middleware) with real authentication against an existing Laravel + Sanctum backend. Users choose between two sign-in paths on the same login/signup screens: email+password (goes straight to Laravel) or Google/GitHub OAuth (goes through Clerk first, then Clerk's verified identity is exchanged for a Laravel session).

**Laravel is the single source of truth for the app's session in both paths.** Clerk is only ever used as a client-side OAuth broker to obtain a verified Google/GitHub identity (as a JWT) — it never owns the app's auth state, and its own session/`setActive` APIs are not used. The token the frontend stores and sends on every API call is always the Laravel Sanctum personal-access token returned by one of `/api/login`, `/api/register`, or `/api/auth/clerk`.

## Existing backend contract (already built, not part of this task)

Base API URL: `http://localhost:8000`

| Endpoint | Method | Body | Response (`data`) |
|---|---|---|---|
| `/api/register` | POST | `{ name, email, password, tenant_name? }` | `{ user, token }`, HTTP 201 |
| `/api/login` | POST | `{ email, password }` | `{ user, token }`, HTTP 200 |
| `/api/logout` | POST | — (Bearer token required) | — |
| `/api/me` | GET | — (Bearer token required) | current user |
| `/api/auth/clerk` | POST | `{ session_token }` (Clerk JWT) | `{ user, token }`, HTTP 200 |

All error responses use `{ success: false, message, error }` with HTTP 422/401/500/501 depending on the failure.

`token` in every success response is a Sanctum `plainTextToken` — this is a **Bearer token**, not a cookie session. The frontend is responsible for storing it and sending `Authorization: Bearer <token>` on every subsequent API request. No Sanctum `stateful` domain or CSRF cookie setup is needed since this isn't cookie-based auth.

CORS: the user will verify `config/cors.php` allows the Nuxt dev origin (`http://localhost:3000`) and that `paths` includes `api/*`. Not something this frontend task can fix — flagged as a dependency to confirm before testing.

`/api/auth/clerk`'s `session_token` is obtained client-side via Clerk's `useAuth().getToken()`. Laravel verifies it independently against Clerk's JWKS (already implemented in `AuthController::verifyClerkToken`) — the frontend does not need to validate or decode this token itself, only forward it.

## Stack addition

- `@clerk/nuxt` (official Nuxt module, built on `@clerk/vue`) — used **only** for its client-side OAuth composables (`useSignIn()`'s `signIn.sso()`, `useAuth().getToken()`). Clerk's own session/`setActive`/`isSignedIn` are not used anywhere in this app — Laravel's token is the only thing that gates access.
- Env vars: `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Clerk publishable key — client-side OAuth only needs this one; no `NUXT_CLERK_SECRET_KEY` is needed frontend-side since token verification happens on the Laravel side, not in Nuxt). Also `NUXT_PUBLIC_API_BASE_URL=http://localhost:8000` for the Laravel API base. Both placeholders in `.env.example`; real Clerk key added by the user after implementation.
- OAuth providers (Google, GitHub) are enabled in the Clerk Dashboard — no code-side provider configuration beyond the strategy string used when initiating the flow.

## What gets removed

- `app/composables/useAuth.ts` (mock module-level `user` ref, `login`/`signup`/`logout`)
- `app/pages/login.vue`, `app/pages/signup.vue` (current mock-backed forms)
- `app/middleware/auth.ts` (current mock `isLoggedIn` check)

## What gets added

### Data layer

- `app/composables/useAuth.ts` (rewritten, same filename/call-site as every other composable in the app):
  ```typescript
  interface LaravelUser {
    id: number
    name: string
    email: string
    current_tenant_id: number | null
    // ...other fields Laravel's User model returns, read loosely
  }

  const user = ref<LaravelUser | null>(null)
  const token = useCookie<string | null>('auth_token', { default: () => null })

  export function useAuth() {
    const isSignedIn = computed(() => !!token.value)
    const config = useRuntimeConfig()

    async function login(email: string, password: string) {
      const res = await $fetch<{ data: { user: LaravelUser; token: string } }>(
        `${config.public.apiBaseUrl}/api/login`,
        { method: 'POST', body: { email, password } }
      )
      token.value = res.data.token
      user.value = res.data.user
    }

    async function register(name: string, email: string, password: string) {
      const res = await $fetch<{ data: { user: LaravelUser; token: string } }>(
        `${config.public.apiBaseUrl}/api/register`,
        { method: 'POST', body: { name, email, password } }
      )
      token.value = res.data.token
      user.value = res.data.user
    }

    async function loginWithClerkToken(sessionToken: string) {
      const res = await $fetch<{ data: { user: LaravelUser; token: string } }>(
        `${config.public.apiBaseUrl}/api/auth/clerk`,
        { method: 'POST', body: { session_token: sessionToken } }
      )
      token.value = res.data.token
      user.value = res.data.user
    }

    async function fetchCurrentUser() {
      if (!token.value) return
      user.value = await $fetch<LaravelUser>(`${config.public.apiBaseUrl}/api/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })
    }

    async function logout() {
      if (token.value) {
        await $fetch(`${config.public.apiBaseUrl}/api/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token.value}` },
        }).catch(() => {}) // token may already be invalid; clear local state regardless
      }
      token.value = null
      user.value = null
    }

    return { user, isSignedIn, login, register, loginWithClerkToken, fetchCurrentUser, logout }
  }
  ```
  Token persists in a cookie (survives refresh — a real improvement over the old fully-in-memory mock, and necessary since a real bearer token needs to outlive a page reload). All error responses from Laravel (422/401/etc.) bubble up as thrown `$fetch` errors; pages catch them and show the `message` field inline.
- `nuxt.config.ts`: add `@clerk/nuxt` to `modules` (for OAuth only); add `runtimeConfig.public.apiBaseUrl` reading from `NUXT_PUBLIC_API_BASE_URL`.
- `.env.example`: `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx` and `NUXT_PUBLIC_API_BASE_URL=http://localhost:8000`.

### Pages

- `app/pages/login.vue` (rewritten): both sign-in methods stacked on one screen, matching the existing dark-card `auth` layout — email/password form on top, a divider ("or continue with"), then Google/GitHub buttons below. Both always visible, no tab click needed:
  - Email/password: existing shadcn `Input`/`Label`/`Button` → `useAuth().login(email, password)` → on success `navigateTo('/dashboard')`; on failure show the Laravel error message inline near the form.
  - OAuth: "Continue with Google" / "Continue with GitHub" buttons → Clerk's `useSignIn()`: `signIn.sso({ strategy: 'oauth_google' | 'oauth_github', redirectUrl: '/sso-callback', redirectUrlComplete: '/sso-callback' })`. (Both redirect params point at the same callback page — completion still needs the callback page to finish the Laravel exchange before the user is actually authed.)
- `app/pages/signup.vue` (rewritten): same stacked layout:
  - Email/password: name + email + password → `useAuth().register(name, email, password)` → `navigateTo('/dashboard')` on success.
  - OAuth: identical Google/GitHub buttons as login (Clerk's `sso()` flow is the same entry point for both sign-in and sign-up — Clerk determines internally whether the identity is new).
- `app/pages/sso-callback.vue` (new): after Clerk completes its redirect, this page:
  1. Uses Clerk's `useAuth()` composable (Clerk's, not this app's — naming collision resolved by importing Clerk's under an alias, e.g. `import { useAuth as useClerkAuth } from '@clerk/nuxt'`) to call `getToken()` and obtain the Clerk session JWT.
  2. Calls this app's `useAuth().loginWithClerkToken(clerkJwt)`, which POSTs to `/api/auth/clerk` and stores the returned Laravel token exactly like the email/password paths do.
  3. Redirects to `/dashboard` on success, or back to `/login` with an inline error on failure (e.g. Laravel's JWKS verification rejects the token, or the network call fails).
  Uses the `default` layout (no dashboard chrome), with a simple centered loading spinner/message while steps 1–2 run.
- `app/middleware/auth.ts` (rewritten): same file path and same `middleware: 'auth'` call-site used by every dashboard page today — only the body changes:
  ```typescript
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
  This means **none of the 11 existing dashboard pages need any changes** — they keep `definePageMeta({ layout: 'dashboard', middleware: 'auth' })` verbatim. The added `fetchCurrentUser()` call re-hydrates `user` from `/api/me` after a page refresh (since `user` itself isn't persisted, only the token cookie is).
- `app/components/layout/TheNavbar.vue`: swap the mock `useAuth()` reads for the new real ones — `user.value?.name` and `user.value?.email` now come from Laravel's `User` model shape instead of the mock shape; `handleLogout` calls the new async `logout()` then `navigateTo('/login')`.
- `app/pages/team.vue`: same `user.value?.name`/`user.value?.email` field-shape update (Laravel's `User` model uses `name`, not the mock's derived-from-email-prefix name).

## Explicit non-goals for this pass

- No changes to the Laravel backend — `AuthController` and its endpoints are already built and are treated as a fixed external contract.
- No Clerk Dashboard configuration (creating the app, enabling Google/GitHub connections) — manual step the user performs outside this codebase.
- No wiring of `useWorkspace`/`useApps`/etc. to real tenant data — those composables stay exactly as mock as they are today. Only auth (login/signup/logout/current-user) becomes real. `current_tenant_id` on the Laravel user is stored but not yet consumed anywhere in the UI.
- No MFA, no organization/team features beyond what already exists in the mock Team page.
- No real end-to-end verification of the Clerk OAuth → Laravel exchange in this pass: this requires both a real Clerk publishable key (not available yet) and the Laravel dev server actually running and reachable at `NUXT_PUBLIC_API_BASE_URL` with CORS configured — neither is guaranteed available during this implementation. Verification in this pass is limited to what's checkable without them: pages render, correct requests are attempted with the right shapes (inspectable via network tab), email/password login works end-to-end **if** a reachable Laravel instance with a real user is available for testing, and the app doesn't crash when Clerk hasn't finished loading or the API is unreachable.

## Testing / verification approach

- Manual dev-server + Playwright check per the project's existing pattern: pages render, no console errors, no emoji icons, cursor-pointer/focus states present, responsive at the same 4 breakpoints as the rest of the app.
- If a real, reachable Laravel instance is available at implementation time: verify the email/password login and register flows end-to-end against it (this is a real, checkable path even without Clerk keys).
- Clerk OAuth round-trip verification is explicitly out of reach until a real Clerk publishable key is supplied — stated as a known limitation, not silently skipped.
