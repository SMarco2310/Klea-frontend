# Landing page Apple-motion redesign pass

Date: 2026-08-05
Scope: `app/pages/index.vue` and its landing components only (`app/components/landing/*`, `app/components/ui/button/*`, `app/assets/css/main.css`). Auth pages, dashboard/app pages, and other subsystems are out of scope for this spec — they get their own specs later if requested.

## Context

The landing page already has an in-progress redesign (dark theme, glass navbar, accent color, scroll-reveal entrances) with uncommitted changes on the branch. This spec applies the Apple Design skill's motion/materials/typography/accessibility principles on top of that work — polish, not a rebuild.

No drag, swipe, or sheet gestures exist on this page (static marketing content), so this pass does **not** introduce a spring physics library (motion-v). It stays CSS/Tailwind-only, tuning easing curves and durations to approximate Apple's damping/response values, per user decision.

## Design

### 1. Motion tokens

Add to `app/assets/css/main.css` inside `@theme` (or a new `:root` block):

```css
--ease-spring-out: cubic-bezier(0.22, 1, 0.36, 1);      /* critically damped feel, response ~0.4s */
--ease-spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* slight overshoot — only for momentum-carrying interactions */
--dur-fast: 120ms;   /* press/hover feedback */
--dur-base: 300ms;   /* small UI transitions (navbar blur ramp, toggle) */
--dur-reveal: 500ms; /* scroll reveal entrances — hard cap, down from current 600-900ms */
```

`--ease-spring-bounce` is reserved for elements where the trigger itself carried momentum or intent (e.g. the pricing yearly/monthly toggle knob). Everything else uses `--ease-spring-out`.

### 2. Response — instant press feedback

`app/components/ui/button/index.ts`: replace `active:not-aria-[haspopup]:translate-y-px` with `active:scale-[0.97] active:duration-75`, so press feedback is visible the instant the pointer goes down, not just on hover.

Apply the same `active:scale-[0.97] active:duration-75` pattern to other clickable, non-Button elements in the landing components:
- `PricingSection.vue` yearly/monthly toggle switch
- `LandingNavbar.vue` "Get started" pill and nav links

### 3. Typography — size-specific tracking/leading

Stop using a single blanket `tracking-tight` across every heading size. New rule of thumb applied per component:

| Element | Tracking | Leading |
|---|---|---|
| Hero h1 (`HeroSection.vue`, 5xl/6xl) | `tracking-[-0.02em]` | `leading-[1.05]` (already correct, keep as-is) |
| Section h2 (`FeatureGrid.vue`, `HowItWorks.vue`, `PricingSection.vue` — 3xl/4xl) | `tracking-[-0.015em]` | `leading-[1.15]` |
| Card/body h3 and paragraph text (feature cards, step cards) | `tracking-normal` (remove existing `tracking-tight`) | `leading-relaxed` (already correct, keep) |

### 4. Materials

- `LandingNavbar.vue` already does the right thing (blur ramps on scroll, bright top sheen line) — no change needed beyond using the new `--dur-base` token for the scroll transition instead of the hardcoded `duration-300`.
- `PricingSection.vue` cards stay flat `bg-white/5` / `.glass-panel` — confirmed no translucent-on-translucent stacking issue since the section background itself is opaque.
- `LandingFooter.vue`: replace the hard `border-t` with a scroll-edge fade — a 1px gradient hairline (`bg-gradient-to-r from-transparent via-white/10 to-transparent`) instead of a solid border, matching the "scroll edge effects, not hard dividers" principle.

### 5. Reduced motion / transparency

Add to `app/assets/css/main.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 120ms !important;
  }
}
@media (prefers-reduced-transparency: reduce) {
  .glass-panel, header nav {
    backdrop-filter: none !important;
    background: var(--color-surface) !important;
  }
}
```

`ScrollReveal.vue` additionally checks `prefers-reduced-motion` in script (via `window.matchMedia`) and when reduced, skips the translate/scale transform classes entirely — opacity-only cross-fade — rather than relying solely on the CSS override, since the transform classes are applied via `:class` bindings that the CSS override can't strip.

### 6. `ScrollReveal.vue` rewrite

- Replace hardcoded `transitionDuration`/`transitionDelay` inline styles driven by props with the `--dur-reveal` token as the default, capped at 500ms even if a caller passes a larger `duration` prop.
- Swap the Tailwind default `ease-out` for `var(--ease-spring-out)`.
- Add the reduced-motion branch described above.
- Prop defaults change: `duration` default 700 → 500, still overridable but clamped to 500 max.

## Files touched

- `app/assets/css/main.css` — motion tokens, reduced-motion/transparency media queries
- `app/components/ui/button/index.ts` — press feedback
- `app/components/landing/ScrollReveal.vue` — token-based easing/duration, reduced-motion branch
- `app/components/landing/LandingNavbar.vue` — press feedback, token duration
- `app/components/landing/PricingSection.vue` — press feedback on toggle, heading tracking/leading, bounce easing on toggle knob
- `app/components/landing/FeatureGrid.vue` — heading tracking/leading, remove card tracking-tight
- `app/components/landing/HowItWorks.vue` — heading tracking/leading, remove card tracking-tight
- `app/components/landing/LandingFooter.vue` — scroll-edge fade instead of hard border
- `app/components/landing/HeroSection.vue`, `CtaBanner.vue`, `CodePreview.vue` — no structural change; inherit token-based easing automatically via ScrollReveal/Button updates

## Out of scope

- No new dependencies (no motion-v/spring library) — decided since no gesture-driven UI exists on this page.
- No changes to auth, dashboard, or app-management pages.
- No changes to page content/copy or layout structure — this is a motion/typography/materials polish pass only.

## Testing

Manual verification in browser (dev server): scroll through the full landing page checking reveal timing/easing, press-test all buttons and the pricing toggle for instant feedback, toggle `prefers-reduced-motion` in devtools and confirm transforms drop out, toggle `prefers-reduced-transparency` and confirm navbar/glass panels go solid. No automated test suite exists for this page currently, so no new tests are added.
