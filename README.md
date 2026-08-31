# Klea — dashboard

Nuxt 3 frontend for Klea. Two audiences share one app:

- **Tenants** (developers) manage applications, plans, features, API keys and
  their wallet.
- **Operators** run the platform at `/admin` — reviewing payouts and watching
  total liability. Not linked from the tenant navigation; reached by URL.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3001
```

The API must be running on `http://localhost:8001` (see `../../Backend/klea-backend`).

```
NUXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

## Things worth knowing before you edit

**`useApi()` already unwraps the response envelope.** It returns `res.data`, so
type calls with the inner type:

```ts
api.get<Plan[]>('/plans')            // correct
api.get<{ data: Plan[] }>('/plans')  // every field comes back undefined
```

That mistake has shipped here before and the build does not catch it.

**Shared composable state uses `useState`,** never a bare `ref` inside the
composable (each caller gets its own copy) or a module-scope `ref` (leaks between
SSR requests). Both have caused real bugs.

**Money arrives as strings.** Prices and balances are `decimal:2` and serialise
as strings. Display them as-is; do not `Number()` them for rendering.

**Operator and tenant sessions are separate.** `admin_token` and `auth_token` are
different cookies, so logging into one does not disturb the other.

## Verification

```bash
npm run build
```

There is **no test suite and no typecheck** — `vue-tsc` is not installed. A green
build is not evidence that a page renders; three runtime bugs have shipped past
one. Check pages in a browser, and treat "it builds" as the floor rather than the
bar.

Installing `vue-tsc` and adding a `typecheck` script is the smallest change with
real payoff here.

## Structure

```
app/
  components/   ui/ (shadcn-style primitives), dashboard/, layout/, landing/
  composables/  one per API resource — useApps, usePlans, usePayouts, useAdminAuth…
  layouts/      default (bare), dashboard (tenant), admin (operator), auth
  middleware/   auth.global, admin
  pages/        [workspaceSlug]/… tenant area, admin/… operator console
i18n/locales/   en.json / fr.json — keep both in sync
```

Run `npm run check:locales` before committing translation changes: a missing
French key falls back to English silently, which is how the previous i18n attempt
ended up half-translated.

## Integration docs

`/docs` in the running app is the developer-facing integration guide — plans,
entitlements, webhooks, the payment flow and its pitfalls. Update it when the
public API changes; it has twice described behaviour that no longer existed.
