<!-- app/pages/docs.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'default' })
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RocketIcon, KeyRoundIcon, FlaskConicalIcon, TerminalIcon, WebhookIcon, ListChecksIcon, SearchIcon } from '@lucide/vue'

const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

const sections = [
  { id: 'quickstart', icon: RocketIcon, label: 'Quickstart' },
  { id: 'authentication', icon: KeyRoundIcon, label: 'Authentication' },
  { id: 'test-vs-live', icon: FlaskConicalIcon, label: 'Test vs Live' },
  { id: 'create-subscription', icon: TerminalIcon, label: 'Create a subscription' },
  { id: 'webhooks', icon: WebhookIcon, label: 'Webhooks' },
  { id: 'status-reference', icon: ListChecksIcon, label: 'Status reference' },
]

const filteredSections = computed(() => {
  if (!searchQuery.value.trim()) return sections
  const q = searchQuery.value.toLowerCase()
  return sections.filter((s) => s.label.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
})

function handleKeydown(e: KeyboardEvent) {
  if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    e.preventDefault()
    searchInputRef.value?.focus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
    <nav class="space-y-4">
      <!-- Brand Logo -->
      <div class="mb-8">
        <NuxtLink to="/" class="font-heading font-bold text-xl tracking-tight text-white flex items-center cursor-pointer select-none">
          <span>Klea</span>
          <span class="text-[var(--color-accent)] font-extrabold text-2xl leading-none">.</span>
        </NuxtLink>
      </div>

      <!-- Search Input inside Docs Sidebar -->
      <div class="relative">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 focus-within:border-teal-500/60 focus-within:ring-1 focus-within:ring-teal-500/30 transition-all">
          <SearchIcon class="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search docs..."
            class="bg-transparent border-none outline-none text-slate-200 text-sm w-full placeholder:text-slate-500"
          />
          <kbd class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono shrink-0">/</kbd>
        </div>
      </div>

      <div class="space-y-1">
        <p class="text-xs uppercase tracking-wide text-slate-500 mb-2 font-medium">Contents</p>
        <a
          v-for="s in filteredSections"
          :key="s.id"
          :href="`#${s.id}`"
          class="flex items-center gap-2 text-sm text-slate-400 hover:text-white cursor-pointer py-1.5 px-2 rounded-md hover:bg-white/5 transition-colors"
        >
          <component :is="s.icon" class="w-4 h-4 text-teal-400 shrink-0" />
          <span>{{ s.label }}</span>
        </a>
        <p v-if="filteredSections.length === 0" class="text-xs text-slate-500 italic px-2 py-1">No matching topics</p>
      </div>
    </nav>

    <div class="space-y-16">
      <section>
        <p class="text-xs uppercase tracking-wide text-[var(--color-accent)] mb-2">Developer guide</p>
        <h1 class="font-heading text-3xl font-bold mb-4">Integrate Klea in minutes</h1>
        <p class="text-slate-400">
          Klea issues and validates licenses through a simple REST API. Create an app, generate a key,
          define a plan, and your subscribers get licensed automatically when they pay.
        </p>
      </section>

      <section id="quickstart">
        <h2 class="font-heading text-2xl font-semibold mb-4">Quickstart</h2>
        <ol class="list-decimal list-inside space-y-2 text-slate-300">
          <li>Create an app from the top-bar app switcher.</li>
          <li>Generate an API key in <strong>Test mode</strong> first.</li>
          <li>Define a plan (price, duration, features).</li>
          <li>Call the API to create a subscriber + subscription on payment.</li>
          <li>Flip to <strong>Live mode</strong> when you're ready to go real.</li>
        </ol>
      </section>

      <section id="authentication">
        <h2 class="font-heading text-2xl font-semibold mb-4">Authentication</h2>
        <p class="text-slate-400 mb-4">
          Every request is authenticated with a bearer token. Secrets are shown only once — store them securely.
        </p>
        <pre class="bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] rounded-xl p-4 text-sm overflow-x-auto"><code>curl https://api.klea.dev/v1/plans \
  -H "Authorization: Bearer lk_test_..."</code></pre>
      </section>

      <section id="test-vs-live">
        <h2 class="font-heading text-2xl font-semibold mb-4">Test vs Live mode</h2>
        <p class="text-slate-400">
          Toggle Test or Live from the top bar. Test mode uses sandbox keys (<code>lk_test_...</code>) and never
          touches real payments; Live mode uses production keys (<code>lk_live_...</code>) and processes real
          transactions. Data is scoped per environment.
        </p>
      </section>

      <section id="create-subscription">
        <h2 class="font-heading text-2xl font-semibold mb-4">Create a subscription</h2>
        <p class="text-slate-400">
          Subscriptions are created automatically when an end user pays through your app's checkout flow, or
          manually via the API for migrations and manual billing.
        </p>
      </section>

      <section id="webhooks">
        <h2 class="font-heading text-2xl font-semibold mb-4">Webhooks</h2>
        <p class="text-slate-400">
          Configure an endpoint on the Overview tab of any app. We deliver subscription lifecycle events
          (created, renewed, canceled) as signed POST requests.
        </p>
      </section>

      <section id="status-reference">
        <h2 class="font-heading text-2xl font-semibold mb-4">Status reference</h2>
        <ul class="space-y-1 text-slate-400">
          <li><code>active</code> — subscription is current and paid</li>
          <li><code>past_due</code> — payment failed, retrying</li>
          <li><code>canceled</code> — subscription ended</li>
        </ul>
      </section>
    </div>
  </div>
</template>
