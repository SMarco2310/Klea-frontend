# Auth pages + real backend wiring (Phase 1)

## Context

Backend now has real endpoints for password reset and email verification
(`POST /forgot-password`, `POST /reset-password`, `GET /email/verify/{id}/{hash}`,
`POST /email/verification-notification`), plus a working `GET /me`. The frontend's
`useKleaAuth` composable only covers login/register/logout/clerk against the real
API; everything else (including `/me`) is either unused or has a response-shape
mismatch. No forgot-password or reset-password pages exist. Email verification has
no frontend surface at all.

This phase wires the frontend auth composable to every real auth endpoint the
backend now exposes, and adds the two pages plus one banner needed to use them.
Tenant invitations UI and the mock-to-real rewiring of the CRUD composables
(apps/plans/features/subscribers/etc.) are explicitly out of scope — later phases.

## Changes

### `app/composables/useKleaAuth.ts`

- `LaravelUser` gains `email_verified_at: string | null`.
- `fetchCurrentUser()` unwraps `res.data` — backend wraps `/me` in
  `{data, success, message}` like every other endpoint; the composable
  previously assumed a raw user object.
- New `forgotPassword(email: string)` → `POST /forgot-password { email }`.
- New `resetPassword(token: string, email: string, password: string, passwordConfirmation: string)`
  → `POST /reset-password { token, email, password, password_confirmation }`.
- New `resendVerificationEmail()` → `POST /email/verification-notification`
  (authed, uses `authHeaders()`).
- No changes to `login`/`register`/`loginWithClerkToken`/`logout` — already correct.

### `app/middleware/auth.ts`

Re-enabled (currently fully commented out, so every page declaring
`middleware: 'auth'` is unprotected today). Now that `/me` unwraps correctly,
this middleware calls `fetchCurrentUser()` and redirects to `/login` when
`isSignedIn` is false.

### `app/pages/forgot-password.vue` (new)

- `layout: 'auth'`, same visual structure/classes as `login.vue` (logo, heading,
  input styling, submit button, error banner).
- Single email field. On submit, calls `forgotPassword(email)`.
- Backend always responds success regardless of whether the account exists (no
  email enumeration), so the UI has one success state after submit — a "check
  your email" message replacing the form — and no "email not found" branch.
- Link back to `/login`.

### `app/pages/reset-password.vue` (new)

- `layout: 'auth'`, same visual structure as `login.vue`.
- Reads `token` and `email` from the route query string (populated by the link
  in the reset email).
- Password + confirm-password fields. On submit, calls
  `resetPassword(token, email, password, passwordConfirmation)`.
- Success: redirect to `/login` (a query param triggers a brief success banner
  there, e.g. `/login?reset=success`).
- Failure (expired/invalid token, backend 422): inline error banner, same
  pattern as `login.vue`'s `errorMessage`.

### `app/pages/login.vue`

Add a "Forgot password?" link near the password field, pointing to
`/forgot-password`. When arriving via `?reset=success`, show a small success
banner ("Password updated — log in with your new password").

### `app/components/dashboard/VerifyEmailBanner.vue` (new)

- Shown at the top of `dashboard.vue` when `user.email_verified_at` is null.
- "Verify your email to unlock all features" + a resend button calling
  `resendVerificationEmail()`, with a brief "sent" confirmation state on the
  button after a successful call.
- Dismissible for the current page load only (local `ref`, not persisted) —
  reappears on next navigation/reload if still unverified, since the
  underlying problem hasn't gone away.
- No dedicated `/verify-email` page: the actual verification link in the email
  hits the backend's signed URL directly
  (`GET /api/email/verify/{id}/{hash}`), not a frontend route.

## Out of scope (later phases)

- Tenant invitation accept/decline UI.
- Rewiring `useApps`/`usePlans`/`useFeatures`/`useSubscribers`/`useSubscriptions`/
  `useWebhooks`/`useApiKeys`/`useEarnings`/`useAnalytics`/`useWorkspace` from
  mock data (`useSeedData`) to real API calls.
- Tenant switch/management UI.
- Subscriber/subscription/transaction/webhook-log detail pages.
