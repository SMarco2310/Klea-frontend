<!-- app/components/landing/GridBeams.vue -->
<script setup lang="ts">
/**
 * Ambient green beams that travel down a few of the background grid lines.
 *
 * The grid in .bg-grid-pattern is a 64px CSS background attached to a !fixed
 * layer, so beams are positioned in `vw` snapped to that same 64px rhythm and
 * sit in a fixed layer too — otherwise they'd drift off the lines on scroll.
 *
 * Purely decorative: aria-hidden, pointer-events none, and fully disabled
 * under prefers-reduced-motion.
 */

interface Beam {
  /** Which 64px gridline the beam rides, counted from the left edge. */
  column: number
  /** Seconds for one top-to-bottom pass. */
  duration: number
  /** Seconds before the first pass starts, so beams don't move in lockstep. */
  delay: number
  /** Beam length as a share of viewport height. */
  height: number
  /**
   * Dim beams that pass behind the hero headline and code panel, so the
   * brightness increase never competes with the text sitting on top of them.
   */
  dim?: boolean
}

// Hand-picked rather than random: spread across the viewport, varied speeds so
// the motion never reads as a repeating pattern, and the columns crossing the
// hero copy (5-10) are kept sparse so text stays the focus.
const beams: Beam[] = [
  { column: 1, duration: 8, delay: 1.7, height: 28 },
  { column: 5, duration: 10.5, delay: 3.6, height: 24, dim: true },
  { column: 12, duration: 8.5, delay: 1.2, height: 26, dim: true },
  { column: 17, duration: 12.5, delay: 4.1, height: 32 },
  { column: 19, duration: 7.5, delay: 0.8, height: 26 },
  { column: 22, duration: 9.5, delay: 3.1, height: 30 },
  { column: 25, duration: 10, delay: 2.1, height: 28 },
]
</script>

<template>
  <div class="grid-beams" aria-hidden="true">
    <span
      v-for="(beam, i) in beams"
      :key="i"
      class="grid-beam"
      :class="{ 'is-dim': beam.dim }"
      :style="{
        left: `calc(${beam.column} * 64px)`,
        height: `${beam.height}vh`,
        animationDuration: `${beam.duration}s`,
        animationDelay: `${beam.delay}s`,
      }"
    />
  </div>
</template>

<style scoped>
.grid-beams {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.grid-beam {
  position: absolute;
  top: 0;
  width: 1px;
  /* Brightest at the head, fading out behind it, so it reads as a travelling
     light rather than a sliding bar. */
  background: linear-gradient(
    to bottom,
    transparent 0%,
    color-mix(in oklch, var(--color-accent) 28%, transparent) 50%,
    color-mix(in oklch, var(--color-accent) 65%, transparent) 85%,
    color-mix(in oklch, var(--color-accent) 92%, transparent) 100%
  );
  /* A tight core glow plus one soft halo — enough to read as light without
     spilling across the whole background. */
  filter:
    drop-shadow(0 0 3px color-mix(in oklch, var(--color-accent) 70%, transparent))
    drop-shadow(0 0 12px color-mix(in oklch, var(--color-accent) 35%, transparent));
  will-change: transform;
  animation-name: grid-beam-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

/* Wide, heavily blurred halo tracking the same path — gives the beam an
   ambient spill onto the surrounding background instead of a hard edge. */
.grid-beam::after {
  content: '';
  position: absolute;
  inset: 0;
  width: 6px;
  margin-left: -2.5px;
  background: inherit;
  filter: blur(4px);
  opacity: 0.3;
}

/* Beams crossing the hero headline and code panel run at reduced intensity so
   the copy on top of them stays comfortably readable. Dimmed via a weaker
   glow rather than `opacity`, which the keyframes already animate. */
.grid-beam.is-dim {
  filter:
    drop-shadow(0 0 2px color-mix(in oklch, var(--color-accent) 45%, transparent))
    drop-shadow(0 0 8px color-mix(in oklch, var(--color-accent) 20%, transparent));
}

.grid-beam.is-dim::after {
  opacity: 0.15;
}

@keyframes grid-beam-fall {
  from {
    /* Start fully above the fold so the head enters cleanly. */
    transform: translateY(-100%);
    opacity: 0;
  }
  6% {
    opacity: 1;
  }
  94% {
    opacity: 1;
  }
  to {
    transform: translateY(100vh);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .grid-beams {
    display: none;
  }
}
</style>
