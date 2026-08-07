# User profile page

## Context

There's currently no way for a logged-in user to view/edit their own account
(name, email, password). `settings.vue` is workspace/tenant-level only (name,
slug, Semoa payment creds, currency) — not personal. `team.vue` shows the
current user read-only. The backend already has a working `PATCH /me`
(`UserController::update`) that accepts `name`, `email`, `password` — nothing
on the frontend calls it.

## Scope

- New `/profile` page: name, email, password. No avatar/photo (would need new
  backend file-storage work, out of scope).
- Lives at its own route, separate from `/settings` (workspace-level) — linked
  from the navbar user-avatar dropdown, alongside Settings/Log out.
- Changing email resets `email_verified_at` server-side and re-sends the
  verification email, consistent with treating "verified" as meaning "verified
  for the address currently on file."

## Backend changes

`app/Http/Controllers/UserController.php`, `update()`:
- When the request changes `email` to a value different from the user's
  current email, additionally set `email_verified_at = null` in the update
  payload and call `$user->sendEmailVerificationNotification()` after saving
  (reuses `App\Notifications\VerifyEmailNotification`, already built for
  registration — no new notification class needed).
- No changes to `UpdateUserRequest` — existing validation (`name` sometimes,
  `email` sometimes/unique-ignoring-self, `password` sometimes/confirmed/min:8)
  already covers this.

## Frontend changes

`app/composables/useAppAuth.ts`:
- New `updateProfile(patch: { name?: string; email?: string; password?: string; password_confirmation?: string })`
  → `PATCH /api/me`, updates local `user` state from the response on success.

`app/pages/profile.vue` (new):
- `definePageMeta({ layout: 'dashboard', middleware: 'auth' })`.
- Three sections, visually matching `settings.vue`'s pattern (icon + heading +
  description per section, shadcn `Input`/`Label`/`Button`):
  1. **Name** — single field, save button.
  2. **Email** — field + save button. If `user.email_verified_at` is null,
     show the same amber "unverified" hint styling used in
     `VerifyEmailBanner.vue` beneath the field.
  3. **Password** — new password + confirm fields only (backend doesn't
     require current-password confirmation for this endpoint), save button.
     Fields clear on successful save.
- Each section saves independently (its own submit, own loading/error state)
  rather than one page-wide form, so changing your name doesn't require also
  re-entering a password.

`app/components/layout/TheNavbar.vue`:
- Add a "Profile" item to the account dropdown (`DropdownMenuContent`,
  currently Settings/Log out), navigating to `/profile`, placed above
  Settings.

## Out of scope

- Avatar/photo upload.
- Current-password confirmation before allowing changes (backend doesn't
  ask for it today; adding that is a separate, bigger auth-hardening change).
- Account deletion.
