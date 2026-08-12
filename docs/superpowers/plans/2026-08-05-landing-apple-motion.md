# Landing Page Apple-Motion Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Apple Design skill's motion/materials/typography/accessibility principles to the landing page (`app/pages/index.vue` and its components), CSS/Tailwind-only, no new dependencies.

**Architecture:** Add a small set of motion design tokens (easing curves, duration scale) to the global stylesheet, then thread them through the existing `ScrollReveal.vue` component and `Button.vue` variant config, then apply typography and materials refinements component-by-component. Each task is independently visually verifiable in the browser — there is no existing automated test suite for this page and the spec explicitly scopes this as a manual-verification, no-new-tests change.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Tailwind CSS v4 (`@theme` tokens in `main.css`), `class-variance-authority` for button variants, `@vueuse/core` for `useIntersectionObserver`.

## Global Constraints

- No new npm dependencies (decided in spec: no motion-v/spring library, CSS-only).
- Scroll-reveal duration hard-capped at 500ms even when a caller passes a larger `duration` prop.
- All new/changed transitions must use the new `--ease-spring-out` / `--ease-spring-bounce` tokens, not ad-hoc `ease-out` classes.
- `--ease-spring-bounce` is reserved for elements where the trigger carried momentum/intent (only the pricing toggle knob in this scope) — everything else uses `--ease-spring-out`.
- Must respect `prefers-reduced-motion: reduce` (transforms drop out, opacity-only) and `prefers-reduced-transparency: reduce` (blur/translucency drop to solid).
- Out of scope: no auth/dashboard/app-page changes, no copy/content/layout-structure changes.
- Dev server for manual verification: `npm run dev` (Nuxt), check `http://localhost:3000/`.

---

### Task 1: Motion tokens + reduced-motion/transparency media queries

**Files:**
- Modify: `app/assets/css/main.css:6-24` (add tokens inside `@theme` block), and append new media-query rules after the existing `@layer components` block (`main.css:151-155`)

**Interfaces:**
- Produces (CSS custom properties consumed by later tasks): `--ease-spring-out`, `--ease-spring-bounce`, `--dur-fast`, `--dur-base`, `--dur-reveal`.

- [ ] **Step 1: Add motion tokens to the `@theme` block**

In `app/assets/css/main.css`, inside the existing `@theme { ... }` block (starts line 6), add after the `--color-border-light` line:

```css
  --ease-spring-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-fast: 120ms;
  --dur-base: 300ms;
  --dur-reveal: 500ms;
```

- [ ] **Step 2: Add reduced-motion and reduced-transparency media queries**

Append to the end of `app/assets/css/main.css`, after the `.glass-panel` rule inside `@layer components`:

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

- [ ] **Step 3: Verify tokens resolve**

Run: `npm run dev`, open `http://localhost:3000/`, open devtools console, run `getComputedStyle(document.documentElement).getPropertyValue('--ease-spring-out')`.
Expected: returns `cubic-bezier(0.22, 1, 0.36, 1)` (not empty string).

- [ ] **Step 4: Verify reduced-motion override**

In devtools, open Rendering tab → "Emulate CSS media feature prefers-reduced-motion" → "reduce". Reload the page. Confirm no console errors. (Visual confirmation of effect happens in Task 3 once `ScrollReveal.vue` consumes it.)

- [ ] **Step 5: Commit**

```bash
git add app/assets/css/main.css
git commit -m "feat: add Apple-motion design tokens and reduced-motion/transparency media queries"
```

---

### Task 2: Button press feedback

**Files:**
- Modify: `app/components/ui/button/index.ts:7`

**Interfaces:**
- Consumes: none (base CVA config, no dependency on Task 1 tokens — uses Tailwind's built-in scale utilities).
- Produces: every `<Button>` instance across the app gets instant scale-down on `:active`. No signature change — existing `variant`/`size` props unaffected.

- [ ] **Step 1: Replace translate-based active state with scale-based press feedback**

In `app/components/ui/button/index.ts` line 7, find this substring in the base class string:

```
active:not-aria-[haspopup]:translate-y-px
```

Replace with:

```
active:not-aria-[haspopup]:scale-[0.97] active:not-aria-[haspopup]:duration-75
```

- [ ] **Step 2: Verify visually**

Run: `npm run dev`, open `http://localhost:3000/`. Mouse-down (don't release) on the hero "Get started free" button.
Expected: button visibly shrinks to 97% scale immediately on press, before release.

- [ ] **Step 3: Commit**

```bash
git add app/components/ui/button/index.ts
git commit -m "feat: instant press-scale feedback on Button component"
```

---

### Task 3: `ScrollReveal.vue` — token-based easing, capped duration, reduced-motion branch

**Files:**
- Modify: `app/components/landing/ScrollReveal.vue` (full rewrite of script + template)

**Interfaces:**
- Consumes: `--ease-spring-out` and `--dur-reveal` tokens from Task 1.
- Produces (unchanged public API, consumed by `index.vue` and all landing components): props `delay?: number`, `duration?: number`, `direction?: 'up' | 'down' | 'left' | 'right' | 'fade'`. Behavior change only: `duration` prop is now clamped to a 500ms max, and reduced-motion strips transform entirely.

- [ ] **Step 1: Rewrite `ScrollReveal.vue`**

Replace the full file content of `app/components/landing/ScrollReveal.vue` with:

```vue
<!-- app/components/landing/ScrollReveal.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    delay?: number
    duration?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  }>(),
  {
    delay: 0,
    duration: 500,
    direction: 'up',
  }
)

const target = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const prefersReducedMotion = ref(false)
if (typeof window !== 'undefined' && window.matchMedia) {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const clampedDuration = computed(() => Math.min(props.duration, 500))

useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    if (isIntersecting) {
      isVisible.value = true
      observerElement.disconnect()
    }
  },
  { threshold: 0.1 }
)
</script>

<template>
  <div
    ref="target"
    style="transition-property: opacity, transform; transition-timing-function: var(--ease-spring-out)"
    :style="{
      transitionDuration: `${clampedDuration}ms`,
      transitionDelay: `${delay}ms`,
    }"
    :class="[
      isVisible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : 'opacity-0 pointer-events-none',
      !prefersReducedMotion && !isVisible && direction === 'up' && 'translate-y-12',
      !prefersReducedMotion && !isVisible && direction === 'down' && '-translate-y-12',
      !prefersReducedMotion && !isVisible && direction === 'left' && 'translate-x-12',
      !prefersReducedMotion && !isVisible && direction === 'right' && '-translate-x-12',
      !prefersReducedMotion && !isVisible && direction === 'fade' && 'scale-95',
    ]"
  >
    <slot />
  </div>
</template>
```

- [ ] **Step 2: Verify normal motion**

Run: `npm run dev`, open `http://localhost:3000/` with devtools Rendering tab NOT emulating reduced motion. Scroll down slowly.
Expected: sections fade/slide in smoothly, settle within ~500ms, no jump or snap.

- [ ] **Step 3: Verify reduced-motion branch**

In devtools Rendering tab, enable "Emulate CSS media feature prefers-reduced-motion: reduce". Reload and scroll down.
Expected: sections only fade in (opacity 0→100), no translate/scale movement.

- [ ] **Step 4: Verify duration clamp**

Check `app/components/landing/PricingSection.vue` usage of `ScrollReveal` with `:duration="700"` (line 65) still renders — confirm in devtools Elements panel that the rendered `transition-duration` on that element's wrapper is `500ms`, not `700ms`.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/ScrollReveal.vue
git commit -m "feat: token-based easing, 500ms duration cap, and reduced-motion support in ScrollReveal"
```

---

### Task 4: `LandingNavbar.vue` — press feedback + token duration

**Files:**
- Modify: `app/components/landing/LandingNavbar.vue`

**Interfaces:**
- Consumes: `--dur-base` token (Task 1).
- Produces: no change to component's public interface (no props).

- [ ] **Step 1: Replace hardcoded scroll-blur duration with token**

In `app/components/landing/LandingNavbar.vue`, the `<header>` element (line 21) has `transition-all duration-300`. Replace `duration-300` with an inline style using the token, since Tailwind utility classes can't reference arbitrary custom properties for duration directly without arbitrary-value syntax. Change:

```html
  <header class="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl transition-all duration-300">
```

to:

```html
  <header
    class="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl transition-all"
    style="transition-duration: var(--dur-base); transition-timing-function: var(--ease-spring-out)"
  >
```

Do the same for the `<nav>` element (line 22-28), which also has `transition-all duration-300`:

```html
    <nav
      class="flex items-center justify-between px-6 py-3.5 rounded-lg border relative overflow-hidden shadow-xl"
      style="transition-duration: var(--dur-base); transition-timing-function: var(--ease-spring-out)"
      :class="
```

(removing `transition-all duration-300` from the `nav` class string since it's now handled by the inline style's `transition-property` — but note `transition-property` needs `all` too; add `transition-property: all` to both inline styles.)

Final `<header>`:
```html
  <header
    class="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl"
    style="transition-property: all; transition-duration: var(--dur-base); transition-timing-function: var(--ease-spring-out)"
  >
```

Final `<nav>` opening tag:
```html
    <nav
      class="flex items-center justify-between px-6 py-3.5 rounded-lg border relative overflow-hidden shadow-xl"
      style="transition-property: all; transition-duration: var(--dur-base); transition-timing-function: var(--ease-spring-out)"
      :class="
        isScrolled
          ? 'border-white/15 bg-zinc-900/70 backdrop-blur-xl shadow-black/60'
          : 'border-white/10 bg-white/[0.06] backdrop-blur-md shadow-black/40'
      "
    >
```

- [ ] **Step 2: Add press feedback to "Get started" pill**

In the same file, find the "Get started" `NuxtLink` (around line 57-62):

```html
        <NuxtLink
          to="/signup"
          class="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--color-accent)] text-slate-950 hover:bg-[var(--color-accent)]/90 cursor-pointer transition-all duration-200 shadow-md shadow-emerald-950/40"
        >
          Get started
        </NuxtLink>
```

Add `active:scale-[0.97] active:duration-75` to the class string:

```html
        <NuxtLink
          to="/signup"
          class="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--color-accent)] text-slate-950 hover:bg-[var(--color-accent)]/90 cursor-pointer transition-all duration-200 active:scale-[0.97] active:duration-75 shadow-md shadow-emerald-950/40"
        >
          Get started
        </NuxtLink>
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, open `http://localhost:3000/`. Scroll page and confirm navbar blur/background transition still animates smoothly (no visual regression). Mouse-down on "Get started" pill and confirm it scales down instantly.

- [ ] **Step 4: Commit**

```bash
git add app/components/landing/LandingNavbar.vue
git commit -m "feat: token-based transitions and press feedback in LandingNavbar"
```

---

### Task 5: `PricingSection.vue` — heading tracking/leading, toggle press feedback + bounce easing

**Files:**
- Modify: `app/components/landing/PricingSection.vue`

**Interfaces:**
- Consumes: `--ease-spring-bounce`, `--dur-base` tokens (Task 1).
- Produces: no change to public interface.

- [ ] **Step 1: Update the "Pricing" section heading (there is no h2 element here — the huge background text is decorative `h2`; the actual visible heading is on cards). Skip — this component has no standalone section h2/h3 needing tracking changes beyond the card `h3` already covered by removing `tracking-tight`.**

Verify: `grep -n "tracking-tight" app/components/landing/PricingSection.vue` returns no matches (confirmed by reading the file in brainstorming — it uses `tracking-tight` only on `tier.price` (`h3` at line 72), which is a 4xl display number, not a card sub-heading, so it correctly keeps tight tracking. No change needed in this step; proceed to Step 2.

- [ ] **Step 2: Add press feedback to the yearly/monthly toggle switch**

In `app/components/landing/PricingSection.vue`, find the toggle `<button>` (around line 100-106):

```html
        <button
          type="button"
          role="switch"
          :aria-checked="isYearly"
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          :class="isYearly ? 'bg-emerald-500' : 'bg-slate-700'"
        >
```

Change `transition-colors duration-200 ease-in-out` to `transition-colors` and add an inline style using the base token:

```html
        <button
          type="button"
          role="switch"
          :aria-checked="isYearly"
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none"
          style="transition-duration: var(--dur-base)"
          :class="isYearly ? 'bg-emerald-500' : 'bg-slate-700'"
        >
```

- [ ] **Step 3: Give the toggle knob the bounce easing (momentum-carrying interaction)**

Find the knob `<span>` immediately after (around line 107-110):

```html
          <span
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
            :class="isYearly ? 'translate-x-5' : 'translate-x-0'"
          />
```

Replace `transition duration-200 ease-in-out` with an inline style using `--ease-spring-bounce` — this is the one element in scope where the trigger (a deliberate click) carries clear intent/momentum, per the Global Constraints rule:

```html
          <span
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition"
            style="transition-duration: var(--dur-base); transition-timing-function: var(--ease-spring-bounce)"
            :class="isYearly ? 'translate-x-5' : 'translate-x-0'"
          />
```

- [ ] **Step 4: Verify**

Run: `npm run dev`, open `http://localhost:3000/`, scroll to pricing section. Click the yearly/monthly toggle repeatedly.
Expected: knob slides with a slight overshoot/settle (bounce), track color transitions smoothly, no visual glitch.

- [ ] **Step 5: Commit**

```bash
git add app/components/landing/PricingSection.vue
git commit -m "feat: token-based transitions and bounce easing on pricing toggle"
```

---

### Task 6: `FeatureGrid.vue` — heading tracking/leading

**Files:**
- Modify: `app/components/landing/FeatureGrid.vue`

**Interfaces:**
- Consumes: none (pure Tailwind class changes).
- Produces: no change to public interface.

- [ ] **Step 1: Update section h2 tracking/leading**

In `app/components/landing/FeatureGrid.vue` line 21:

```html
        <h2 class="font-heading text-3xl md:text-4xl font-semibold mt-3 tracking-tight">Everything you need to license software</h2>
```

Replace with:

```html
        <h2 class="font-heading text-3xl md:text-4xl font-semibold mt-3 tracking-[-0.015em] leading-[1.15]">Everything you need to license software</h2>
```

- [ ] **Step 2: Remove tight tracking from card h3**

Line 38:

```html
          <h3 class="font-heading font-semibold mb-1.5">{{ item.title }}</h3>
```

This line has no `tracking-tight` class already — confirm via `grep -n "tracking-tight" app/components/landing/FeatureGrid.vue`. If it returns no match, no change needed here. If a match is found on this line, remove the `tracking-tight` class.

- [ ] **Step 3: Verify**

Run: `npm run dev`, open `http://localhost:3000/`, scroll to features section.
Expected: heading renders correctly, visually similar (subtle tightening), no layout break, card titles unaffected.

- [ ] **Step 4: Commit**

```bash
git add app/components/landing/FeatureGrid.vue
git commit -m "feat: size-specific tracking/leading on FeatureGrid heading"
```

---

### Task 7: `HowItWorks.vue` — heading tracking/leading

**Files:**
- Modify: `app/components/landing/HowItWorks.vue`

**Interfaces:**
- Consumes: none.
- Produces: no change to public interface.

- [ ] **Step 1: Update section h2 tracking/leading**

In `app/components/landing/HowItWorks.vue` line 18:

```html
        <h2 class="font-heading text-3xl md:text-4xl font-semibold mt-3 tracking-tight">From zero to licensed</h2>
```

Replace with:

```html
        <h2 class="font-heading text-3xl md:text-4xl font-semibold mt-3 tracking-[-0.015em] leading-[1.15]">From zero to licensed</h2>
```

- [ ] **Step 2: Verify step h3 has no tight tracking**

Run: `grep -n "tracking-tight" app/components/landing/HowItWorks.vue`. Expected: no matches remain (the `h3` at line 35 already has no `tracking-tight`).

- [ ] **Step 3: Verify visually**

Run: `npm run dev`, open `http://localhost:3000/`, scroll to "From zero to licensed" section.
Expected: heading renders correctly, step cards unaffected.

- [ ] **Step 4: Commit**

```bash
git add app/components/landing/HowItWorks.vue
git commit -m "feat: size-specific tracking/leading on HowItWorks heading"
```

---

### Task 8: `LandingFooter.vue` — scroll-edge fade instead of hard border

**Files:**
- Modify: `app/components/landing/LandingFooter.vue`

**Interfaces:**
- Consumes: none.
- Produces: no change to public interface.

- [ ] **Step 1: Replace hard border-t with gradient hairline**

Replace the full content of `app/components/landing/LandingFooter.vue`:

```vue
<!-- app/components/landing/LandingFooter.vue -->
<template>
  <footer class="relative px-6 py-8">
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden="true" />
    <div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-400">
      <span class="font-mono text-xs">© 2026 Klea<span class="text-[var(--color-accent)]">.</span></span>
      <div class="flex gap-4">
        <NuxtLink to="/docs" class="hover:text-white cursor-pointer">Docs</NuxtLink>
        <NuxtLink to="/login" class="hover:text-white cursor-pointer">Login</NuxtLink>
        <NuxtLink to="/signup" class="hover:text-white cursor-pointer">Signup</NuxtLink>
      </div>
    </div>
  </footer>
</template>
```

- [ ] **Step 2: Verify**

Run: `npm run dev`, open `http://localhost:3000/`, scroll to the bottom.
Expected: footer top edge shows a soft gradient hairline instead of a hard solid line; footer content unchanged.

- [ ] **Step 3: Commit**

```bash
git add app/components/landing/LandingFooter.vue
git commit -m "feat: scroll-edge fade hairline on LandingFooter instead of hard border"
```

---

### Task 9: Full-page manual verification pass

**Files:** none modified — verification only.

**Interfaces:** none.

- [ ] **Step 1: Normal motion full pass**

Run: `npm run dev`, open `http://localhost:3000/` in a fresh tab (no reduced-motion emulation). Scroll from top to bottom slowly, then back up. Press-test every button (hero CTAs, navbar CTA, pricing card CTAs, CTA banner button) by holding mouse down without releasing.

Expected: all scroll reveals settle within ~500ms with a smooth spring-like ease (no linear/mechanical feel), every button visibly scales down the instant it's pressed, navbar blur ramps smoothly on scroll, pricing toggle knob shows slight bounce on click, footer shows gradient hairline not hard border.

- [ ] **Step 2: Reduced-motion pass**

In devtools Rendering tab, enable "Emulate CSS media feature prefers-reduced-motion: reduce". Reload and repeat the scroll pass.

Expected: sections cross-fade only (no slide/scale transforms), transitions feel snappier/shorter, no broken layout.

- [ ] **Step 3: Reduced-transparency pass**

In devtools Rendering tab, enable "Emulate CSS media feature prefers-reduced-transparency: reduce" (in addition to or instead of reduced-motion). Reload.

Expected: navbar and any `.glass-panel` surfaces render as solid `var(--color-surface)` background with no blur, text remains fully legible.

- [ ] **Step 4: Confirm no regressions in unrelated pages**

Run: `npm run dev`, spot-check `/login` and `/dashboard` (if reachable without auth setup, otherwise just confirm no build/type errors reference these files).

Expected: `Button.vue` changes (Task 2) apply globally — confirm buttons on at least one other page (e.g. `/login`) still render correctly with the new press-scale behavior and no layout break.

- [ ] **Step 5: Final commit (if any fixups were needed)**

If Steps 1-4 surfaced no issues, no commit needed — this task is verification-only. If issues were found and fixed, commit those fixes with a descriptive message before considering the plan complete.
