# API Keys Tab + Auth Form Validation: Design Spec

Date: 2026-08-03
Status: Approved

## Summary

Two pieces of work:

1. **API Keys tab** — a new per-app sub-tab (mock data, same pattern as Plans/Features) that lets a user generate named API keys. A newly generated key's full value is shown exactly once in a copy-to-clipboard dialog; after that, only a masked version is ever displayed again. This wires up the previously-hardcoded "API Keys: 0" stat card on the dashboard to real (mock) data.
2. **Auth form input validation** — client-side hygiene checks (format, length, trimming) on the login/signup forms. This is defense-in-depth and UX polish, not a SQL-injection fix — Laravel's Eloquent ORM and its own `LoginRequest`/`RegisterRequest` validation are the actual authority against injection; the frontend cannot prevent SQL injection since it never touches a database.

## Part 1: API Keys tab

### Data model

New composable `app/composables/useApiKeys.ts`, following the exact pattern of `usePlans.ts`/`useFeatures.ts` (scoped-by-appId, backed by `useSeedData`'s shared reactive arrays):

```typescript
interface ApiKey {
  id: string
  appId: string
  name: string
  env: 'test' | 'live'
  maskedKey: string   // e.g. "lk_live_....f6g7" — always stored/displayed
  createdAt: string   // ISO date
}

function useApiKeys(appId: string): {
  apiKeys: ComputedRef<ApiKey[]>  // filtered by appId AND current useEnvMode()
  createApiKey: (name: string) => { record: ApiKey; fullKey: string }
  revokeApiKey: (id: string) => void
}
```

`createApiKey` generates a fake full key client-side (`lk_{env}_` + a random alphanumeric string), stores only `{ ...record, maskedKey }` in the shared reactive array (the masked form: prefix + `....` + last 4 characters), and returns the **full** key value to the caller as a one-time return value — it is never stored anywhere, never appears in the list, and is lost the moment the caller's local variable goes out of scope (matches the real product's "shown once" security pattern, mocked faithfully).

Seed data: no pre-existing keys on the demo app (empty list), so the empty state is the default first-visit experience — matches every other list tab's seeded-vs-empty pattern already established in this app.

### UI

- `app/components/layout/TheSubTabs.vue`: add an 8th tab, "API Keys", positioned after "Webhooks".
- `app/pages/apps/[slug]/api-keys.vue` (new): follows the Plans/Features page shape.
  - List state: each row shows name, masked key (monospace), created date, and a trash/revoke icon-button (same visual treatment as Plans' delete button).
  - Empty state: existing `EmptyState` component, icon = `KeyIcon`, title "No API keys yet", description "Generate a key to start authenticating requests.", CTA "New key".
  - "New key" button opens a `Dialog` with two states:
    1. **Form state**: single "Key name" text input (e.g. placeholder "Production server") + Create button.
    2. **Reveal state** (replaces the form after creation, same dialog): the full key in a monospace, selectable box + a "Copy" button (clipboard API) + a clear warning line ("This key won't be shown again — copy it now.") + a "Done" button that closes the dialog and returns to the list, which now shows the new key's masked row.
  - List and creation are scoped by the current env mode (Test/Live toggle) exactly like Subscribers/Subscriptions — switching modes shows/generates keys with the matching `lk_test_`/`lk_live_` prefix.
- `app/pages/dashboard.vue`: the existing `StatCard label="API Keys" :value="0"` becomes a real count — sum of API keys across all apps in the current env (a workspace-level rollup, matching how `useEarnings` already rolls up across apps).

## Part 2: Auth form validation

Applies to `app/pages/login.vue` and `app/pages/signup.vue` only (not app-wide — scoped per this task's decision).

- **Email**: format-validated with a simple regex before calling `useAuth().login`/`register` (the native `type="email"` input already present provides browser-level validation; this adds an explicit check with an inline error message using the same error-banner pattern already used for Laravel API errors, so validation errors and server errors look identical to the user).
- **Password**: minimum 8 characters before submit.
- **Name** (signup only): trimmed, rejects empty/whitespace-only, max 100 characters.
- All fields: values are trimmed before being sent to `useAuth()`'s methods.
- These checks run before the network call, short-circuiting obviously-invalid submissions; Laravel's own validation remains the real authority and still runs server-side regardless.

**Explicit framing**: this is input hygiene / UX (catch obvious mistakes early, reduce garbage reaching the API), not a SQL-injection defense. SQL injection is prevented by Laravel's Eloquent ORM using parameterized queries — nothing on the frontend can prevent it, since the frontend never constructs SQL. No claim to the contrary appears in any commit or comment produced by this work.

## Explicit non-goals

- No real API-key backend — keys are mock/client-side only, matching every other entity in this app (Plans, Features, Subscribers, etc.).
- No permissions/scopes per key, no expiry dates, no last-used tracking — matches the "name + created date + masked value + revoke" v1 scope decided during design.
- No validation changes to any form outside login/signup (Plans/Features/Settings/etc. forms are untouched).
- No backend/Laravel changes — this is a frontend-only pass; verifying Laravel's `AuthController` and Eloquent usage is not part of this task (it already uses `User::where(...)`/`Hash::check`/`DB::transaction`, which are injection-safe by construction, confirmed by reading the controller in the prior auth-integration work).

## Testing / verification approach

Same as every prior task in this app: manual dev-server + Playwright verification (page renders, no console errors, no emoji icons, cursor-pointer/focus states, responsive at 375/768/1024/1440px), plus a functional check that: creating a key shows the full value once, the key disappears from the visible full-value after closing/reopening, the masked row persists in the list, revoke removes it, and the dashboard stat count updates accordingly. Auth form validation verified by submitting invalid values (bad email format, short password, empty name) and confirming inline errors appear without a network call being made.
