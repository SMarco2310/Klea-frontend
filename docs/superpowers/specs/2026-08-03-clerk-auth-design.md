# Clerk Authentication: Design Spec

Date: 2026-08-03
Status: Approved

## Summary

Replace Klea's mock in-memory authentication (`useAuth` composable, custom `/login` and `/signup` pages, `auth.ts` middleware) with real authentication via Clerk, using the official `@clerk/nuxt` module. Supports email+password and OAuth (Google, GitHub) sign-in/sign-up, with fully custom UI matching the app's existing dark-slate/sage-green design (not Clerk's prebuilt `<SignIn>`/`<SignUp>` components).

## Stack addition

- `@clerk/nuxt` (official Nuxt module, built on `@clerk/vue`) — provides `useUser()`, `useAuth()`, `useClerk()`, `useSignIn()`, `useSignUp()` composables and `clerkMiddleware()`.
- Env vars: `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NUXT_CLERK_SECRET_KEY` — placeholders committed to `.env.example`; real values added by the user to `.env` (gitignored) after implementation, not available during this build.
- OAuth providers (Google, GitHub) are enabled in the Clerk Dashboard (SSO connections page) — no code-side provider configuration beyond the strategy string used when initiating the flow. Dashboard configuration is a manual step for the user, outside this codebase.

## What gets removed

- `app/composables/useAuth.ts` (mock module-level `user` ref, `login`/`signup`/`logout`)
- `app/pages/login.vue`, `app/pages/signup.vue` (current mock-backed forms)
- `app/middleware/auth.ts` (current mock `isLoggedIn` check)

## What gets added

- `nuxt.config.ts`: add `@clerk/nuxt` to `modules`.
- `.env.example`: placeholder `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx` and `NUXT_CLERK_SECRET_KEY=sk_test_xxx` lines with a comment pointing to the Clerk Dashboard API keys page.
- `app/pages/login.vue` (rewritten): email + password fields (existing shadcn `Input`/`Label`/`Button`, same dark-card `auth` layout), plus "Continue with Google" and "Continue with GitHub" buttons. Submits via `useSignIn()`'s headless flow:
  - Email/password: `signIn.create({ identifier: email, password })` → on `status === 'complete'`, `setActive({ session: signIn.createdSessionId })` → `navigateTo('/dashboard')`.
  - OAuth: `signIn.sso({ strategy: 'oauth_google' | 'oauth_github', redirectUrl: '/sso-callback', redirectUrlComplete: '/dashboard' })`.
  - Errors (wrong password, unknown identifier) surface inline near the form, matching the existing error-feedback UX guideline (clear message near the problem, not a toast).
- `app/pages/signup.vue` (rewritten): name + email + password fields, same OAuth buttons. Submits via `useSignUp()`:
  - `signUp.create({ emailAddress: email, password })`.
  - If the Clerk instance requires email verification (`status === 'missing_requirements'` with an unverified email), show a second step: a single code-input field, `signUp.attemptEmailAddressVerification({ code })`.
  - On `status === 'complete'`, `setActive({ session: signUp.createdSessionId })` → `navigateTo('/dashboard')`.
- `app/pages/sso-callback.vue` (new): handles the OAuth redirect target. Per Clerk's sign-in/sign-up transfer pattern, this page calls both `useSignIn()` and `useSignUp()`, checks each object's `status`, and calls `signIn.finalize()` or `signUp.finalize()` as appropriate (Clerk auto-transfers an OAuth attempt from `SignIn` to `SignUp` if the user has no existing account). Uses the `default` layout (no dashboard chrome) with a simple centered loading state while the exchange completes, then redirects to `/dashboard`.
- `app/middleware/auth.ts` (rewritten): same file path and same `middleware: 'auth'` call-site used by every dashboard page today — only the body changes:
  ```typescript
  export default defineNuxtRouteMiddleware(() => {
    const { isSignedIn } = useAuth()
    if (!isSignedIn.value) {
      return navigateTo('/login')
    }
  })
  ```
  This means **none of the 11 existing dashboard pages need any changes** — they keep `definePageMeta({ layout: 'dashboard', middleware: 'auth' })` verbatim.
- `app/components/layout/TheNavbar.vue`: swap the mock `const { user, logout } = useAuth()` for `const { user } = useUser()` and `const { signOut } = useClerk()`; update the avatar initial/name/email reads to Clerk's `User` object shape (`user.value?.firstName`, `user.value?.primaryEmailAddress?.emailAddress`) and the logout handler to call `signOut()` then `navigateTo('/login')`.
- `app/pages/team.vue`: same `useUser()` swap for the single member row (was reading mock `useAuth()`'s `user`).

## Explicit non-goals for this pass

- No Clerk Dashboard configuration (creating the app, enabling Google/GitHub connections, setting redirect URLs) — that's a manual step the user performs outside this codebase using their own Clerk account.
- No multi-factor authentication, organization/team features, or Clerk's Billing — only email+password and Google/GitHub OAuth sign-in/sign-up as requested.
- No real end-to-end verification of the OAuth redirect round-trip or email verification code flow in this pass, since no real Clerk API keys are available during implementation (placeholders only). Verification in this pass is limited to: pages render without crashing, correct Clerk API calls are made with the right arguments (inspectable via network/console), and the app doesn't break when Clerk's composables return "not loaded yet" / signed-out states. Full live-flow verification happens once the user adds real keys.

## Testing / verification approach

- Manual dev-server + Playwright check per the project's existing pattern: pages render, no console errors, no emoji icons, cursor-pointer/focus states present, responsive at the same 4 breakpoints as the rest of the app.
- Cannot verify actual authentication succeeding (no real Clerk keys yet) — this is a known, stated limitation of this pass, not a silently skipped requirement.
