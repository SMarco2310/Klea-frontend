# Klea — License & Subscription Management Platform: Design Spec

Date: 2026-08-03
Status: Approved

## Summary

Klea is a B2B SaaS dev-tool: issue and validate software licenses/subscriptions via API. This spec covers a full frontend build on a blank Nuxt 4 scaffold — landing page, auth UI, and full dashboard (workspace + multi-app management), all wired to in-memory mock data (no real backend yet). Design/UX reference is a set of screenshots of a comparable product ("LicenseKit").

## Stack

- Nuxt 4 (already scaffolded), Vue 3, vue-router
- Tailwind CSS (to be added — not yet installed)
- Lucide icons (SVG, no emoji icons)
- No component library (shadcn-vue/Nuxt UI) — custom components styled with Tailwind
- Fonts: Space Grotesk (headings), DM Sans or Inter (body) — loaded via Google Fonts

## Visual system

- **Theme**: dark-first, with light mode supported (both must pass 4.5:1 contrast).
- **Colors**:
  - Background (dark): near-black `#0B0F14`–`#0F172A` range
  - Surface/card (dark): slate `#1E293B`
  - Accent: sage/muted green (matches screenshots' `Active`/`Live` pill and primary buttons — not neon green)
  - Text (dark mode): `#F8FAFC` primary, slate-400+ minimum for muted labels
  - Light mode: white/slate-50 surfaces, slate-900 text, same accent green
- **Typography**: Space Grotesk for headings (bold, technical feel), DM Sans/Inter for body
- **Style**: minimal flat SaaS dashboard — subtle borders, low-contrast dividers, pill-style active nav state, card-based stat tiles. NOT vibrant/block/playful — restrained, developer-tool tone.
- **Icons**: Lucide, consistent 20–24px sizing
- Standard a11y/interaction rules apply: cursor-pointer on clickables, 150–300ms transitions, visible focus rings, `prefers-reduced-motion` respected, no layout-shifting hover transforms.

## Known UX issues to avoid (from screenshot review, carried into this build)

- Don't show derived stats (e.g. "success rate") as if meaningful when the underlying count is 0 — show `—` or hide the stat card instead.
- Empty states need an actionable CTA, not just passive text (e.g. "Generate your first API key" button on empty API Keys state).
- One consistent "active nav item" treatment across top-level nav and sub-tabs (not 3 different styles).
- Floating support/help bubble (if included) must never overlap card content — add safe margin.
- Secret/API-key input fields should be masked by default with a reveal toggle.
- Test mode already implies a warning banner in the reference; add an equivalent (lighter-weight) indicator for Live mode so switching real-money context is never visually silent.

## Information architecture / routes

```
/                          Landing page (marketing) — layout: default
/login                     Login — layout: auth
/signup                    Signup — layout: auth
/dashboard                 Apps overview (workspace home) — layout: dashboard
/earnings                  Earnings (workspace-level) — layout: dashboard
/team                      Team (workspace-level, member list) — layout: dashboard
/settings                  Workspace settings (name/slug, payment gateway keys) — layout: dashboard
/apps/:slug                App detail shell — layout: dashboard, with sub-tabs:
  /apps/:slug/overview        Overview (webhook endpoint config, general app info)
  /apps/:slug/plans           Plans (list, create/edit/delete)
  /apps/:slug/features        Features (list, create/edit/delete)
  /apps/:slug/subscribers     Subscribers (list)
  /apps/:slug/subscriptions   Subscriptions (list, status filter, env filter: Test/Live)
  /apps/:slug/analytics       Analytics (stat cards + revenue-over-time + plan-distribution charts)
  /apps/:slug/webhooks        Webhooks (endpoint config + delivery log)
/docs                      Docs page (quickstart, auth, test vs live, create-subscription, webhooks, status reference) — layout: default (or a docs-specific variant of default), mostly static content
```

### Layouts

- `default` — used by landing page and docs page. No dashboard chrome.
- `auth` — centered card layout for login/signup, no dashboard chrome.
- `dashboard` — persistent top navbar (logo, workspace/app switcher, primary nav: Apps/Earnings/Team/Settings, Test/Live toggle, Search, Docs link, notifications, avatar menu) + Test-mode amber sandbox banner when in Test mode + Live-mode banner variant + content slot. App-detail routes additionally render the sub-tab bar (Overview/Plans/Features/Subscribers/Subscriptions/Analytics/Webhooks) inside this layout.

## Data model & mock state

All state is in-memory, reactive, seeded on app load, and reset on full page refresh (no persistence layer in this pass). Implemented as Nuxt auto-imported composables:

```
useAuth()            — { user, isLoggedIn, login(), signup(), logout() } — any input succeeds (no real validation)
useWorkspace()       — { workspace: { name, slug }, updateSettings() }
useApps()            — { apps[], currentApp, createApp(), selectApp() }
                        App = { id, name, slug, status: 'active' | 'inactive', webhookUrl? }
usePlans(appId)      — Plan = { id, name, price, interval, features: string[] }
useFeatures(appId)   — Feature = { id, key, description }
useSubscribers(appId)— Subscriber = { id, email, plan, status, joinedAt }
useSubscriptions(appId) — Subscription = { id, subscriberId, planId, status, env: 'test' | 'live', createdAt }
useAnalytics(appId)  — derived from subscriptions + subscribers: activeSubs, revenue, transactions, successRate
                        (successRate renders as '—' when transactions === 0)
useWebhooks(appId)   — deliveries: mock log entries[], endpoint config
useEarnings()        — workspace-level rollup across all apps
useEnvMode()         — { mode: 'test' | 'live' }, toggle scopes all data queries by env
```

Seed data: one default demo app pre-populated with a couple of plans, features, subscribers, and subscriptions (test + live) so the dashboard is not all-zero on first load. The "New app" creation flow must still produce a real empty state (reachable and demoable) for a freshly created app.

All create/edit/delete actions (new app, new plan, new feature, etc.) mutate the reactive in-memory arrays directly — no network calls in this pass.

## Landing page structure

1. Navbar — logo, nav links (Features / Docs / Pricing anchors), Login + "Get started" CTA
2. Hero — headline + subheadline (API-first licensing pitch), primary CTA ("Get started free") + secondary ("View docs"), visual: code snippet or dashboard screenshot mockup
3. Feature grid — 4–6 cards: API-first licensing, Test/Live modes, Webhooks, Plans & features, Analytics, Payment gateway integration
4. How it works — 3–4 step flow (Create app → Generate key → Define plan → Go live), mirrors docs quickstart
5. Code/API preview section — static styled syntax-highlighted snippet (auth example)
6. Pricing — simple placeholder 2–3 tier pricing block
7. CTA banner — "Start shipping licenses today" + signup button
8. Footer — links (Docs, Login, Signup), copyright

No fake customer logo bar (omitted — avoid fabricated social proof).

## Explicit non-goals for this pass

- No real backend/API integration
- No real Semoa (or any) payment gateway integration
- No real webhook delivery
- No email sending
- No real authentication/session security (mock session only)
- No multi-workspace or team-invite backend logic (Team page exists as UI/mock list only)
- No persistence beyond the in-memory session (refresh resets state)

## Testing / verification approach

- Manual verification via dev server + browser check (Nuxt dev, visually compare against reference screenshots and against the pre-delivery checklist: no emoji icons, cursor-pointer on clickables, contrast in both themes, responsive at 375/768/1024/1440px, no content hidden behind fixed nav).
- No automated test framework is currently configured in this project; adding one is out of scope for this pass unless requested separately.
