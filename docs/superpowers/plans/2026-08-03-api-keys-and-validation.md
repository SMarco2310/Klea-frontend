# API Keys Tab + Auth Form Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-app API Keys sub-tab with mock key generation (show-once full value, masked thereafter, revoke), wire the dashboard's hardcoded "API Keys" stat to real data, and add client-side validation plus a password-visibility toggle to the login/signup forms — per `docs/superpowers/specs/2026-08-03-api-keys-and-validation.md`.

**Architecture:** `useApiKeys(appId)` composable follows the exact shape of `usePlans`/`useFeatures` (scoped-by-appId computed view over a shared reactive array in `useSeedData`), additionally filtered by the current `useEnvMode()` the same way `useSubscribers`/`useSubscriptions` already are. `createApiKey` returns the full key value directly to its caller (never stored) while pushing only the masked form into the shared array — this is the mechanism that makes "shown once" real rather than cosmetic. The API Keys page reuses the existing `Dialog`/`EmptyState` components and the Plans page's list-row visual style. Auth form changes are additive to the existing `login.vue`/`signup.vue` — no architecture change, just validation logic and a UI toggle already proven in `settings.vue`.

**Tech Stack:** Same as the rest of the app — Nuxt 4 composables, Vue `ref`/`computed`, shadcn `Dialog`/`Input`/`Label`/`Button`, `@lucide/vue` icons, Tailwind.

## Global Constraints

- API keys are mock/client-side only — no real backend, matching every other entity in this app (spec §Explicit non-goals).
- Key fields: name, created date, masked value, revoke action only — no permissions/scopes/expiry/last-used (spec §Data model, per design decision).
- API Keys list/creation scoped by the current env mode (Test/Live) exactly like Subscribers/Subscriptions (spec §UI).
- Masked format: prefix (`lk_test_`/`lk_live_`) + `....` + last 4 characters of the generated key (spec §Key format, per design decision).
- The full key value must never be stored in any reactive/persisted state — only returned once to the immediate caller (spec §Data model).
- Auth form validation applies ONLY to `login.vue`/`signup.vue` — no other forms in the app are touched (spec §Part 2, scope decision).
- Do not claim or imply anywhere (code comments, commit messages) that frontend validation prevents SQL injection — that is Eloquent's responsibility on the Laravel side (spec §Part 2 explicit framing).
- No emoji icons, `cursor-pointer` on all interactive elements, visible focus states, responsive at 375/768/1024/1440px with no page-body horizontal overflow — same project-wide rules as every prior task.

---

## File Structure

```
app/
  composables/
    useSeedData.ts        — MODIFY: add ApiKey interface + apiKeys reactive array + seed (empty)
    useApiKeys.ts          — NEW: scoped-by-appId-and-env composable, createApiKey/revokeApiKey
  components/layout/
    TheSubTabs.vue         — MODIFY: add "API Keys" as 8th tab, after Webhooks
  pages/
    apps/[slug]/
      api-keys.vue          — NEW: list + create dialog with two-state (form -> reveal) flow
    dashboard.vue           — MODIFY: API Keys stat card wired to a real workspace-wide rollup
    login.vue                — MODIFY: password eye-toggle + validation before submit
    signup.vue                — MODIFY: password eye-toggle + validation before submit
```

No changes to: any other composable, any other page, `useSeedData`'s existing entities (App/Plan/Feature/Subscriber/Subscription/WebhookDelivery interfaces are untouched, only a new interface + array is added alongside them).

---

## Task 1: useApiKeys composable + seed data wiring

**Files:**
- Modify: `app/composables/useSeedData.ts`
- Create: `app/composables/useApiKeys.ts`

**Interfaces:**
- Consumes: `useSeedData()`'s existing pattern (Task 3 of the original Klea plan established this shape — module-level `ref` array, `seeded` guard), `useEnvMode()`
- Produces (exact signatures Task 2/3 rely on):

```typescript
// useSeedData.ts addition
export interface ApiKey {
  id: string
  appId: string
  name: string
  env: 'test' | 'live'
  maskedKey: string
  createdAt: string
}
// useSeedData() return value gains: apiKeys: Ref<ApiKey[]>

// useApiKeys.ts
function useApiKeys(appId: string): {
  apiKeys: ComputedRef<ApiKey[]>
  createApiKey: (name: string) => { record: ApiKey; fullKey: string }
  revokeApiKey: (id: string) => void
}
```

- [ ] **Step 1: Add `ApiKey` interface and reactive array to `useSeedData.ts`**

Edit `app/composables/useSeedData.ts`. Add the interface alongside the existing ones (after `WebhookDelivery`):

```typescript
export interface ApiKey {
  id: string
  appId: string
  name: string
  env: 'test' | 'live'
  maskedKey: string
  createdAt: string
}
```

Add the reactive array alongside the existing module-level refs:

```typescript
const apiKeys = ref<ApiKey[]>([])
```

In the `useSeedData()` function body, inside the `if (!seeded)` block, after the existing `webhookDeliveries.value = []` line, add:

```typescript
apiKeys.value = []
```

Update the function's return statement to include `apiKeys`:

```typescript
return { apps, plans, features, subscribers, subscriptions, webhookDeliveries, apiKeys }
```

- [ ] **Step 2: Write `app/composables/useApiKeys.ts`**

```typescript
// app/composables/useApiKeys.ts
function generateFullKey(env: 'test' | 'live'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let random = ''
  for (let i = 0; i < 32; i++) {
    random += chars[Math.floor(Math.random() * chars.length)]
  }
  return `lk_${env}_${random}`
}

function maskKey(fullKey: string, env: 'test' | 'live'): string {
  const prefix = `lk_${env}_`
  const tail = fullKey.slice(-4)
  return `${prefix}....${tail}`
}

export function useApiKeys(appId: string) {
  const { apiKeys } = useSeedData()
  const { mode } = useEnvMode()

  const scopedApiKeys = computed(() =>
    apiKeys.value.filter((k) => k.appId === appId && k.env === mode.value)
  )

  function createApiKey(name: string) {
    const env = mode.value
    const fullKey = generateFullKey(env)
    const record: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      appId,
      name,
      env,
      maskedKey: maskKey(fullKey, env),
      createdAt: new Date().toISOString(),
    }
    apiKeys.value.push(record)
    return { record, fullKey }
  }

  function revokeApiKey(id: string) {
    apiKeys.value = apiKeys.value.filter((k) => k.id !== id)
  }

  return { apiKeys: scopedApiKeys, createApiKey, revokeApiKey }
}

type ApiKeyRecord = import('./useSeedData').ApiKey
```

Note: `ApiKeyRecord` is aliased via an inline type-only import at the bottom of the file, matching the exact style already used in `usePlans.ts`/`useFeatures.ts` (`import('./useSeedData').Plan` inline references) — keep this consistent rather than introducing a top-level `import type` statement, since the existing codebase's reviewer already confirmed this inline style is intentional (Task 3 review of the original Klea plan).

- [ ] **Step 3: Manual verification via a scratch check**

Temporarily add to `app/pages/index.vue` (revert after — same rule as every prior scratch-test task in this app's history):

```vue
<script setup lang="ts">
const { createApiKey, apiKeys, revokeApiKey } = useApiKeys('app-demo')
const result = ref('')
function test() {
  const { record, fullKey } = createApiKey('Test Key')
  result.value = `full: ${fullKey} | masked in list: ${apiKeys.value.find(k => k.id === record.id)?.maskedKey}`
}
</script>
<template>
  <button @click="test">{{ result || 'run test' }}</button>
</template>
```

Run `npm run dev`, click the button. Expected: the full key (`lk_live_...` 32 random chars) and the masked version (`lk_live_....XXXX`, last 4 chars matching the full key's tail) both print, confirming the masking logic is correct and the full key is only available via the function's return value — not by reading `apiKeys.value` directly. Revert this temporary edit; `index.vue` must return to its committed landing-page content (verify with `git diff app/pages/index.vue` showing no output).

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useSeedData.ts app/composables/useApiKeys.ts
git commit -m "feat: add useApiKeys composable with show-once key generation"
```

---

## Task 2: API Keys page + sub-tab

**Files:**
- Modify: `app/components/layout/TheSubTabs.vue`
- Create: `app/pages/apps/[slug]/api-keys.vue`

**Interfaces:**
- Consumes: `useApiKeys()` (Task 1), `useApps()`, shadcn `Dialog`/`Input`/`Label`/`Button` (already installed), `EmptyState` (`app/components/dashboard/EmptyState.vue`), `TheSubTabs` (this task modifies it)
- Produces: nothing further downstream (leaf page)

- [ ] **Step 1: Add the "API Keys" tab to `TheSubTabs.vue`**

Edit `app/components/layout/TheSubTabs.vue`. In the `tabs` array, add a new entry after `Webhooks`:

```typescript
const tabs = [
  { label: 'Overview', to: `/apps/${slug}/overview` },
  { label: 'Plans', to: `/apps/${slug}/plans` },
  { label: 'Features', to: `/apps/${slug}/features` },
  { label: 'Subscribers', to: `/apps/${slug}/subscribers` },
  { label: 'Subscriptions', to: `/apps/${slug}/subscriptions` },
  { label: 'Analytics', to: `/apps/${slug}/analytics` },
  { label: 'Webhooks', to: `/apps/${slug}/webhooks` },
  { label: 'API Keys', to: `/apps/${slug}/api-keys` },
]
```

No other changes to this file — the template already iterates `tabs` generically.

- [ ] **Step 2: Write `app/pages/apps/[slug]/api-keys.vue`**

```vue
<!-- app/pages/apps/[slug]/api-keys.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { KeyIcon, PlusIcon, Trash2Icon, CopyIcon, CheckIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { formatDate } from '~/utils/format'
import TheSubTabs from '~/components/layout/TheSubTabs.vue'
import EmptyState from '~/components/dashboard/EmptyState.vue'

const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? '')
const { apiKeys, createApiKey, revokeApiKey } = useApiKeys(appId.value)

const createOpen = ref(false)
const name = ref('')
const revealedKey = ref<string | null>(null)
const copied = ref(false)

function handleCreate() {
  if (!name.value.trim()) return
  const { fullKey } = createApiKey(name.value.trim())
  revealedKey.value = fullKey
  name.value = ''
}

async function copyKey() {
  if (!revealedKey.value) return
  await navigator.clipboard.writeText(revealedKey.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function closeDialog() {
  createOpen.value = false
  revealedKey.value = null
  copied.value = false
}
</script>

<template>
  <div>
    <TheSubTabs />
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm text-slate-400">{{ apiKeys.length }} key{{ apiKeys.length === 1 ? '' : 's' }}</span>
      <Button class="cursor-pointer gap-1" @click="createOpen = true">
        <PlusIcon class="w-4 h-4" /> New key
      </Button>
    </div>

    <EmptyState
      v-if="apiKeys.length === 0"
      :icon="KeyIcon"
      title="No API keys yet"
      description="Generate a key to start authenticating requests."
      cta-label="New key"
      @cta="createOpen = true"
    />

    <div v-else class="space-y-3">
      <div
        v-for="key in apiKeys"
        :key="key.id"
        class="flex items-center justify-between p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-dark)]"
      >
        <div>
          <div class="font-medium">{{ key.name }}</div>
          <div class="text-sm text-slate-400 font-mono">{{ key.maskedKey }}</div>
          <div class="text-xs text-slate-500 mt-1">Created {{ formatDate(key.createdAt) }}</div>
        </div>
        <button class="text-slate-400 hover:text-red-400 cursor-pointer" :aria-label="`Revoke ${key.name}`" @click="revokeApiKey(key.id)">
          <Trash2Icon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <Dialog v-model:open="createOpen">
      <DialogContent>
        <template v-if="!revealedKey">
          <DialogHeader>
            <DialogTitle>New API key</DialogTitle>
            <DialogDescription>Give this key a name so you can identify it later.</DialogDescription>
          </DialogHeader>
          <div class="space-y-4 py-2">
            <div class="space-y-2">
              <Label for="key-name">Key name</Label>
              <Input id="key-name" v-model="name" placeholder="Production server" />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="ghost" class="cursor-pointer" @click="closeDialog">Cancel</Button>
            <Button class="cursor-pointer" :disabled="!name.trim()" @click="handleCreate">Create key</Button>
          </div>
        </template>
        <template v-else>
          <DialogHeader>
            <DialogTitle>Key created</DialogTitle>
            <DialogDescription>Copy this key now — you won't be able to see it again.</DialogDescription>
          </DialogHeader>
          <div class="py-2">
            <div class="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)]">
              <code class="text-sm font-mono flex-1 break-all select-all">{{ revealedKey }}</code>
              <button class="text-slate-400 hover:text-white cursor-pointer shrink-0" aria-label="Copy key" @click="copyKey">
                <component :is="copied ? CheckIcon : CopyIcon" class="w-4 h-4" />
              </button>
            </div>
            <p class="text-xs text-amber-400 mt-3">This key won't be shown again — copy it now.</p>
          </div>
          <div class="flex justify-end">
            <Button class="cursor-pointer" @click="closeDialog">Done</Button>
          </div>
        </template>
      </DialogContent>
    </Dialog>
  </div>
</template>
```

- [ ] **Step 3: Wire the dashboard's API Keys stat card to a real rollup**

Read `app/pages/dashboard.vue` first to find the exact current line (`<StatCard label="API Keys" :value="0" :icon="KeyIcon" sublabel="Issued keys" />`) and the surrounding `<script setup>` imports before editing, since this plan cannot see the file's current full content at write time — confirm the import list and add whatever is missing.

Add a workspace-wide API key count. Since `useApiKeys` is scoped to one `appId`, and the dashboard needs a total across all apps, add this small inline computation directly in `dashboard.vue`'s script (do not create a new composable for this — it's a two-line rollup, matching the YAGNI principle already applied throughout this codebase):

```typescript
// in app/pages/dashboard.vue's <script setup>, alongside the existing useApps()/useEnvMode() calls:
const { apiKeys: allApiKeysRaw } = useSeedData()
const { mode: envMode } = useEnvMode()
const totalApiKeys = computed(
  () => allApiKeysRaw.value.filter((k) => k.env === envMode.value).length
)
```

Then change the stat card's `:value="0"` to `:value="totalApiKeys"`.

(Naming note: `mode` from `useEnvMode()` may already be destructured elsewhere in this file under a different local name — check the existing script block for a naming collision before adding `mode: envMode` and adjust the alias if `envMode` is already taken or if `mode` is already imported and unaliased elsewhere in the same scope.)

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, log in, navigate to `/apps/demo-app/api-keys` via the sub-tab bar.
Expected: empty state renders ("No API keys yet"). Click "New key", type a name, click "Create key" — dialog switches to the reveal state showing the full key in a monospace box. Click the copy icon — icon briefly changes to a checkmark. Click "Done" — dialog closes, list now shows one row with the masked key (not the full key), name, and created date. Click the trash icon — key disappears from the list, empty state returns.

Toggle Test/Live mode in the navbar — confirm the key created while in one mode disappears from the list when switching to the other mode (env-scoping working), and reappears when switching back.

Navigate to `/dashboard` — confirm the "API Keys" stat card shows a count matching the number of keys that exist in the currently-active env mode across all apps (with only the demo app, this equals however many keys you created and didn't revoke, filtered by env).

Resize to 375px on the API Keys page — confirm no horizontal page overflow.

- [ ] **Step 5: Run production build**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 6: Commit**

```bash
git add app/components/layout/TheSubTabs.vue app/pages/apps/\[slug\]/api-keys.vue app/pages/dashboard.vue
git commit -m "feat: add API Keys tab and wire dashboard stat to real count"
```

---

## Task 3: Auth form validation + password visibility toggle

**Files:**
- Modify: `app/pages/login.vue`
- Modify: `app/pages/signup.vue`

**Interfaces:**
- Consumes: existing `useAuth()`/`extractAuthErrorMessage` (already wired), shadcn `Input` (already installed), `@lucide/vue`'s `EyeIcon`/`EyeOffIcon` (already used in `settings.vue`, confirmed available)
- Produces: nothing further downstream (leaf pages)

- [ ] **Step 1: Add password visibility toggle + validation to `login.vue`**

Edit `app/pages/login.vue`. Add to the imports:

```typescript
import { EyeIcon, EyeOffIcon } from '@lucide/vue'
```

Add a `showPassword` ref alongside the existing `email`/`password` refs:

```typescript
const showPassword = ref(false)
```

Add a validation helper function, placed before `handleSubmit`:

```typescript
function validate(): string | null {
  const trimmedEmail = email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return 'Please enter a valid email address.'
  }
  if (password.value.length < 8) {
    return 'Password must be at least 8 characters.'
  }
  return null
}
```

Update `handleSubmit` to call `validate()` first and trim email before sending:

```typescript
async function handleSubmit() {
  if (!email.value || !password.value) return
  errorMessage.value = ''
  const validationError = validate()
  if (validationError) {
    errorMessage.value = validationError
    return
  }
  isSubmitting.value = true
  try {
    await login(email.value.trim(), password.value)
    await navigateTo('/dashboard')
  } catch (e) {
    errorMessage.value = extractAuthErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}
```

Update the password field's template block to add the eye-toggle, matching `settings.vue`'s exact existing pattern:

```vue
<div class="space-y-2">
  <Label for="password">Password</Label>
  <div class="relative">
    <Input
      id="password"
      v-model="password"
      :type="showPassword ? 'text' : 'password'"
      placeholder="••••••••"
      required
    />
    <button
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
      @click="showPassword = !showPassword"
    >
      <component :is="showPassword ? EyeOffIcon : EyeIcon" class="w-4 h-4" />
    </button>
  </div>
</div>
```

- [ ] **Step 2: Add password visibility toggle + validation to `signup.vue`**

Edit `app/pages/signup.vue`. Same import addition:

```typescript
import { EyeIcon, EyeOffIcon } from '@lucide/vue'
```

Same `showPassword` ref addition.

Validation helper (adds the name check on top of login's email/password checks):

```typescript
function validate(): string | null {
  const trimmedName = name.value.trim()
  if (!trimmedName) {
    return 'Please enter your name.'
  }
  if (trimmedName.length > 100) {
    return 'Name is too long.'
  }
  const trimmedEmail = email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return 'Please enter a valid email address.'
  }
  if (password.value.length < 8) {
    return 'Password must be at least 8 characters.'
  }
  return null
}
```

Update `handleSubmit`:

```typescript
async function handleSubmit() {
  if (!name.value || !email.value || !password.value) return
  errorMessage.value = ''
  const validationError = validate()
  if (validationError) {
    errorMessage.value = validationError
    return
  }
  isSubmitting.value = true
  try {
    await register(name.value.trim(), email.value.trim(), password.value)
    await navigateTo('/dashboard')
  } catch (e) {
    errorMessage.value = extractAuthErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}
```

Same password-field template change as login.vue (identical block, same `id="password"`).

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open `/login`.
Test invalid email: type `notanemail` in email, any 8+ char password, submit — expect inline error "Please enter a valid email address." and no network request fired (confirm via browser devtools network tab or by noting the error appears instantly, not after a delay).
Test short password: valid email, `short` as password (5 chars), submit — expect "Password must be at least 8 characters."
Test the eye toggle: type a password, confirm it's masked (dots) by default, click the eye icon, confirm it becomes visible plaintext, icon swaps to eye-off, click again to re-mask.

Repeat all three checks on `/signup`, plus: submit with name field containing only whitespace (e.g. three spaces) — expect "Please enter your name." (whitespace-only must be rejected, not accepted as a valid name).

Resize both pages to 375px — confirm no overflow introduced by the eye-icon addition (the icon is absolutely positioned inside the existing input wrapper, should not affect layout width).

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 5: Commit**

```bash
git add app/pages/login.vue app/pages/signup.vue
git commit -m "feat: add password visibility toggle and client-side validation to auth forms"
```

---

## Task 4: Final verification pass

**Files:**
- Modify: any file flagged during this pass (exact files depend on findings)

**Interfaces:**
- Consumes: everything built in Tasks 1–3
- Produces: nothing (verification-only task)

- [ ] **Step 1: Full route walk**

Run: `npm run dev`. Log in, visit `/apps/demo-app/api-keys`, `/login`, `/signup`. Confirm no console errors on any of the three, no emoji icons, `cursor-pointer` present on every button/icon-button (including the new copy button, revoke button, and eye-toggle buttons), focus states visible when tabbing through the API key creation dialog and the login/signup forms.

- [ ] **Step 2: Responsive check**

Resize `/apps/demo-app/api-keys`, `/login`, `/signup` to 375px, 768px, 1024px, 1440px — confirm no horizontal overflow at any width.

- [ ] **Step 3: Cross-check the dashboard stat against manual key creation**

With a clean session (or after noting existing state), create 2 keys on the demo app while in Live mode, revoke 1, switch to Test mode and create 1 more. Navigate to `/dashboard` while in Test mode — expect the API Keys stat to show `1`. Switch to Live mode — expect it to show `1` (2 created, 1 revoked). This confirms the rollup in Task 2 Step 3 is counting correctly, not just present.

- [ ] **Step 4: Production build**

Run: `npm run build` — confirm it completes with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: final verification pass for API keys and auth validation"
```
