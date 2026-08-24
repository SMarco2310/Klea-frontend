<!-- app/pages/docs.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'default' })
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RocketIcon, KeyRoundIcon, FlaskConicalIcon, ListIcon, TerminalIcon, WebhookIcon, ListChecksIcon, SearchIcon, MoonIcon, SunIcon, ExternalLinkIcon, MonitorIcon, LanguagesIcon } from '@lucide/vue'
import DocsCodeBlock from '~/components/Docs/CodeBlock.vue'
import DocsLanguageTabs from '~/components/Docs/LanguageTabs.vue'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'

const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl

const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const { colorMode } = useTheme()
const { availableLocales, setLocale } = useLocale()

function changeLanguage(code: string) {
  setLocale(code)
}

const sections = [
  { id: 'quickstart', icon: RocketIcon, label: 'Quickstart' },
  { id: 'authentication', icon: KeyRoundIcon, label: 'Authentication' },
  { id: 'environments', icon: FlaskConicalIcon, label: 'Test vs Live' },
  { id: 'list-plans', icon: ListIcon, label: 'List plans' },
  { id: 'create-subscription', icon: TerminalIcon, label: 'Create a subscription' },
  { id: 'webhooks', icon: WebhookIcon, label: 'Webhooks' },
  { id: 'errors', icon: ListChecksIcon, label: 'Errors' },
]

const filteredSections = computed(() => {
  if (!searchQuery.value.trim()) return sections
  const q = searchQuery.value.toLowerCase()
  return sections.filter((s) => s.label.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
})

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
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

// --- Code samples -----------------------------------------------------

const listPlansSamples = {
  curl: {
    lang: 'bash',
    code: `curl ${apiBase}/api/public/plans \\
  -H "Authorization: Bearer {public_id}.{secret}"`,
  },
  JavaScript: {
    lang: 'javascript',
    code: `const res = await fetch('${apiBase}/api/public/plans', {
  headers: {
    Authorization: 'Bearer {public_id}.{secret}',
  },
})
const { data: plans } = await res.json()`,
  },
  PHP: {
    lang: 'php',
    code: `use Illuminate\\Support\\Facades\\Http;

$response = Http::withToken('{public_id}.{secret}')
    ->get('${apiBase}/api/public/plans');

$plans = $response->json('data');`,
  },
  Python: {
    lang: 'python',
    code: `import requests

response = requests.get(
    "${apiBase}/api/public/plans",
    headers={"Authorization": "Bearer {public_id}.{secret}"},
)
plans = response.json()["data"]`,
  },
  Java: {
    lang: 'java',
    code: `HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${apiBase}/api/public/plans"))
    .header("Authorization", "Bearer {public_id}.{secret}")
    .GET()
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());`,
  },
}

const listPlansResponse = `{
  "data": [
    {
      "id": 1,
      "application_id": 6,
      "name": "Pro",
      "price": "1000.00",
      "currency": "FCFA",
      "duration_days": 30,
      "grace_period_days": 3,
      "yearly_discount_percent": 15,
      "position": 1,
      "is_active": true,
      "features": [
        { 
          "id": 4, 
          "name": "API Access", 
          "code": "api_calls", 
          "description": "Full access to the REST API", 
          "pivot": { "limit": 10000 } 
        }
      ]
    }
  ],
  "success": true,
  "message": "Fetched plans successfully"
}`

const subscribeSamples = {
  curl: {
    lang: 'bash',
    code: `curl -X POST ${apiBase}/api/public/subscribe \\
  -H "Authorization: Bearer {public_id}.{secret}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "plan_id": 1,
    "external_id": "user_482",
    "phone_number": "+22507000000",
    "email": "user@example.com"
  }'`,
  },
  JavaScript: {
    lang: 'javascript',
    code: `const res = await fetch('${apiBase}/api/public/subscribe', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer {public_id}.{secret}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    plan_id: 1,
    external_id: 'user_482', // your own user id
    phone_number: '+22507000000',
    email: 'user@example.com', // optional
  }),
})
const { data } = await res.json()
// redirect your user to data.payment_url to complete payment`,
  },
  PHP: {
    lang: 'php',
    code: `use Illuminate\\Support\\Facades\\Http;

$response = Http::withToken('{public_id}.{secret}')
    ->post('${apiBase}/api/public/subscribe', [
        'plan_id' => 1,
        'external_id' => 'user_482',
        'phone_number' => '+22507000000',
        'email' => 'user@example.com',
    ]);

$paymentUrl = $response->json('data.payment_url');`,
  },
  Python: {
    lang: 'python',
    code: `import requests

response = requests.post(
    "${apiBase}/api/public/subscribe",
    headers={"Authorization": "Bearer {public_id}.{secret}"},
    json={
        "plan_id": 1,
        "external_id": "user_482",
        "phone_number": "+22507000000",
        "email": "user@example.com",
    },
)
payment_url = response.json()["data"]["payment_url"]`,
  },
  Java: {
    lang: 'java',
    code: `String body = """
    {"plan_id":1,"external_id":"user_482","phone_number":"+22507000000","email":"user@example.com"}
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${apiBase}/api/public/subscribe"))
    .header("Authorization", "Bearer {public_id}.{secret}")
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());`,
  },
}

const subscribeResponse = `{
  "data": {
    "subscription_id": 123,
    "transaction_id": 456,
    "amount": "1000.00",
    "currency": "FCFA",
    "payment_url": "https://pay.semoa.io/...",
    "qrcode_url": "https://pay.semoa.io/qr/..."
  },
  "success": true,
  "message": "Subscription created, complete payment via payment_url"
}`

const webhookPayload = `{
  "event": "subscription.payment_result",
  "status": "successful",
  "subscription_id": 123,
  "subscriber_external_id": "user_482",
  "plan_id": 1,
  "features": [
    { 
      "id": 4, 
      "name": "API Access", 
      "code": "api_calls", 
      "description": "Full access to the REST API", 
      "limit": 10000 
    }
  ],
  "transaction": {
    "id": 456,
    "amount": "1000.00",
    "currency": "FCFA"
  }
}`

const webhookVerifySamples = {
  JavaScript: {
    lang: 'javascript',
    code: `import crypto from 'node:crypto'

function isValidSignature(transactionId, signatureHeader, webhookSecret) {
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(String(transactionId))
    .digest('hex')
  return expected === signatureHeader
}

// req.body.transaction.id, req.headers['x-klea-signature']
const valid = isValidSignature(req.body.transaction.id, req.headers['x-klea-signature'], process.env.KLEA_WEBHOOK_SECRET)`,
  },
  PHP: {
    lang: 'php',
    code: `$transactionId = $payload['transaction']['id'];
$signature = $request->header('X-Klea-Signature');

$expected = hash_hmac('sha256', (string) $transactionId, $webhookSecret);

if (! hash_equals($expected, $signature)) {
    abort(401, 'Invalid webhook signature');
}`,
  },
  Python: {
    lang: 'python',
    code: `import hashlib
import hmac

def is_valid_signature(transaction_id: int, signature_header: str, webhook_secret: str) -> bool:
    expected = hmac.new(
        webhook_secret.encode(),
        str(transaction_id).encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)`,
  },
  Java: {
    lang: 'java',
    code: `Mac mac = Mac.getInstance("HmacSHA256");
mac.init(new SecretKeySpec(webhookSecret.getBytes(), "HmacSHA256"));
byte[] hash = mac.doFinal(String.valueOf(transactionId).getBytes());
String expected = HexFormat.of().formatHex(hash);

boolean valid = MessageDigest.isEqual(expected.getBytes(), signatureHeader.getBytes());`,
  },
}

const validationErrorSample = `{
  "success": false,
  "message": "The plan id field is required. (and 2 more errors)",
  "error": {
    "plan_id": ["The plan id field is required."],
    "external_id": ["The external id field is required."],
    "phone_number": ["The phone number field is required."]
  }
}`
</script>

<template>
  <div class="h-screen flex flex-col">
    <header class="shrink-0 border-b border-[var(--color-border-dark)] bg-[var(--color-surface)]">
      <div class="max-w-5xl mx-auto px-6 py-4 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10 items-center">
        <NuxtLink to="/" class="notranslate font-heading font-bold text-xl tracking-tight text-[var(--foreground)] flex items-center cursor-pointer select-none">
          <span>Klea</span>
          <span class="text-[var(--color-accent)] font-extrabold text-2xl leading-none">.</span>
        </NuxtLink>

        <div class="flex items-center gap-3">
          <div class="relative flex-1">
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] text-sm text-[var(--muted-foreground)] focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)] transition-all">
              <SearchIcon class="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                placeholder="Search docs..."
                class="bg-transparent border-none outline-none text-[var(--foreground)] text-sm w-full placeholder:text-[var(--muted-foreground)]"
              />
              <kbd class="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border-dark)] text-[var(--muted-foreground)] font-mono shrink-0">⌘K</kbd>
            </div>
          </div>

          <div class="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] shrink-0">
            <button
              class="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-colors"
              :class="colorMode === 'light' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-accent)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
              aria-label="Light mode"
              @click="colorMode = 'light'"
            >
              <SunIcon class="w-4 h-4" />
            </button>
            <button
              class="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-colors"
              :class="colorMode === 'dark' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-accent)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
              aria-label="Dark mode"
              @click="colorMode = 'dark'"
            >
              <MoonIcon class="w-4 h-4" />
            </button>
            <button
              class="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-colors"
              :class="colorMode === 'auto' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-accent)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
              aria-label="System theme"
              @click="colorMode = 'auto'"
            >
              <MonitorIcon class="w-4 h-4" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                class="flex items-center justify-center w-[36px] h-[36px] rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer transition-colors shrink-0"
                aria-label="Change language"
              >
                <LanguagesIcon class="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-40 border-[var(--color-border-dark)] bg-[var(--color-surface)]/95 backdrop-blur-xl">
              <DropdownMenuItem
                v-for="l in availableLocales"
                :key="l.code"
                class="cursor-pointer"
                @click="changeLanguage(l.code)"
              >{{ l.name }}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    <div class="flex-1 min-h-0 max-w-5xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
    <nav class="space-y-4 py-10">
      <div class="space-y-1">
        <p class="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-2 font-medium">Contents</p>
        <a
          v-for="s in filteredSections"
          :key="s.id"
          :href="`#${s.id}`"
          class="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer py-1.5 px-2 rounded-md hover:bg-[var(--color-hover)] transition-colors"
        >
          <component :is="s.icon" class="w-4 h-4 text-[var(--color-accent)] shrink-0" />
          <span>{{ s.label }}</span>
        </a>
        <p v-if="filteredSections.length === 0" class="text-xs text-[var(--muted-foreground)] italic px-2 py-1">No matching topics</p>
      </div>

      <a
        :href="`${apiBase}/docs/api`"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline cursor-pointer py-1.5 px-2 rounded-md hover:bg-[var(--color-hover)] transition-colors"
      >
        <ExternalLinkIcon class="w-4 h-4 shrink-0" />
        <span>Full API reference</span>
      </a>
    </nav>

    <div class="space-y-16 text-[var(--foreground)] overflow-y-auto py-10">
      <section>
        <p class="text-xs uppercase tracking-wide text-[var(--color-accent)] mb-2">Developer guide</p>
        <h1 class="font-heading text-3xl font-bold mb-4">Integrate <span class="notranslate">Klea</span> in minutes</h1>
        <p class="text-[var(--muted-foreground)]">
          <span class="notranslate">Klea</span> handles subscriptions and payments for your app. Create an application, generate an API
          key, define a plan, and call one endpoint to start a subscriber's subscription.
        </p>
      </section>

      <section id="quickstart">
        <h2 class="font-heading text-2xl font-semibold mb-4">Quickstart</h2>
        <ol class="list-decimal list-inside space-y-2 text-[var(--muted-foreground)]">
          <li><NuxtLink to="/signup" class="text-[var(--color-accent)] hover:underline">Create a <span class="notranslate">Klea</span> account</NuxtLink> — this also creates your first workspace.</li>
          <li>From the dashboard, create an <strong class="text-[var(--foreground)]">Application</strong> for the app you're integrating.</li>
          <li>Under that application, generate an <strong class="text-[var(--foreground)]">API key</strong> — the secret is shown once, so store it now.</li>
          <li>Define at least one <strong class="text-[var(--foreground)]">plan</strong> (price, duration, features) under the application.</li>
          <li>Call <a href="#list-plans" class="text-[var(--color-accent)] hover:underline">List plans</a> to show pricing, then <a href="#create-subscription" class="text-[var(--color-accent)] hover:underline">Create a subscription</a> when a user picks one.</li>
        </ol>
      </section>

      <section id="authentication">
        <h2 class="font-heading text-2xl font-semibold mb-4">Authentication</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          Every request to the public API is authenticated with an API key, sent as a bearer token in
          the format <code class="bg-[var(--color-surface)] px-1 rounded">{public_id}.{secret}</code> — the two halves generated together when you create the key, joined by a period.
          Get a key from your application's <strong class="text-[var(--foreground)]">API Keys</strong> tab. The secret is shown exactly once at creation time and can't be
          retrieved again — if you lose it, revoke the key and generate a new one.
        </p>
        <DocsCodeBlock
          code="Authorization: Bearer {public_id}.{secret}"
          lang="bash"
        />
      </section>

      <section id="environments">
        <h2 class="font-heading text-2xl font-semibold mb-4">Test vs Live</h2>
        <p class="text-[var(--muted-foreground)]">
          Every API key and every subscriber/subscription record has an <code class="bg-[var(--color-surface)] px-1 rounded">environment</code>
          of either <code class="bg-[var(--color-surface)] px-1 rounded">test</code> or <code class="bg-[var(--color-surface)] px-1 rounded">live</code>.
          Today this is a label for your own filtering and reporting — it is <strong class="text-[var(--foreground)]">not currently enforced</strong> as an
          isolated sandbox: a test-environment key can read and write live-environment data and vice
          versa, and no separate test database or mock payment flow exists. Treat the distinction as
          informational until stated otherwise, and don't rely on it for data isolation.
        </p>
      </section>

      <section id="list-plans">
        <h2 class="font-heading text-2xl font-semibold mb-4">List plans</h2>
        <p class="text-[var(--muted-foreground)] mb-1">
          <code class="bg-[var(--color-surface)] px-1 rounded">GET /api/public/plans</code> — returns the active plans (with their features) for the application whose key you authenticated with.
        </p>
        <DocsLanguageTabs :samples="listPlansSamples" />
        <p class="text-sm font-medium text-[var(--foreground)] mt-6 mb-1">Response — 200</p>
        <DocsCodeBlock :code="listPlansResponse" lang="json" />
      </section>

      <section id="create-subscription">
        <h2 class="font-heading text-2xl font-semibold mb-4">Create a subscription</h2>
        <p class="text-[var(--muted-foreground)] mb-1">
          <code class="bg-[var(--color-surface)] px-1 rounded">POST /api/public/subscribe</code> — creates the subscriber if new, a pending subscription, a pending transaction, and returns a payment link.
        </p>

        <table class="w-full text-sm mt-4 mb-6 border border-[var(--color-border-dark)] rounded-lg overflow-hidden bg-[var(--color-bg)]">
          <thead class="bg-[var(--color-surface)] text-[var(--muted-foreground)]">
            <tr>
              <th class="text-left font-medium px-4 py-2">Field</th>
              <th class="text-left font-medium px-4 py-2">Type</th>
              <th class="text-left font-medium px-4 py-2">Required</th>
              <th class="text-left font-medium px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--color-border-dark)] text-[var(--muted-foreground)]">
            <tr>
              <td class="px-4 py-2 font-mono text-xs text-[var(--foreground)]">plan_id</td>
              <td class="px-4 py-2">integer</td>
              <td class="px-4 py-2">yes</td>
              <td class="px-4 py-2">Must belong to your application.</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-xs text-[var(--foreground)]">external_id</td>
              <td class="px-4 py-2">string</td>
              <td class="px-4 py-2">yes</td>
              <td class="px-4 py-2">Your own identifier for this user.</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-xs text-[var(--foreground)]">phone_number</td>
              <td class="px-4 py-2">string</td>
              <td class="px-4 py-2">yes</td>
              <td class="px-4 py-2">Used for the payment provider.</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-xs text-[var(--foreground)]">email</td>
              <td class="px-4 py-2">string</td>
              <td class="px-4 py-2">no</td>
              <td class="px-4 py-2">&nbsp;</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-xs text-[var(--foreground)]">environment</td>
              <td class="px-4 py-2">"test" | "live"</td>
              <td class="px-4 py-2">no</td>
              <td class="px-4 py-2">Defaults to "live". See Test vs Live above.</td>
            </tr>
          </tbody>
        </table>

        <DocsLanguageTabs :samples="subscribeSamples" />
        <p class="text-sm font-medium text-[var(--foreground)] mt-6 mb-1">Response — 201</p>
        <DocsCodeBlock :code="subscribeResponse" lang="json" />
        <p class="text-[var(--muted-foreground)] text-sm mt-3">
          Redirect your user to <code class="bg-[var(--color-surface)] px-1 rounded">data.payment_url</code> (or render <code class="bg-[var(--color-surface)] px-1 rounded">data.qrcode_url</code>) to complete payment.
          Either can be <code class="bg-[var(--color-surface)] px-1 rounded">null</code> if the payment provider didn't return one — handle that case.
          The subscription is <code class="bg-[var(--color-surface)] px-1 rounded">pending</code> until payment settles; that's what the webhook below tells you about.
        </p>
      </section>

      <section id="webhooks">
        <h2 class="font-heading text-2xl font-semibold mb-4">Webhooks</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          Set a <strong class="text-[var(--foreground)]">webhook URL</strong> on your application (Settings tab) and <span class="notranslate">Klea</span>
          <code class="bg-[var(--color-surface)] px-1 rounded">POST</code>s to it once a subscriber's payment settles. There is currently one event,
          <code class="bg-[var(--color-surface)] px-1 rounded">subscription.payment_result</code>. If no webhook URL is configured, nothing is sent — no error is raised.
        </p>
        <p class="text-sm font-medium text-[var(--foreground)] mb-1">Payload</p>
        <DocsCodeBlock :code="webhookPayload" lang="json" />

        <p class="text-[var(--muted-foreground)] mt-6 mb-1">
          Every delivery includes an <code class="bg-[var(--color-surface)] px-1 rounded">X-Klea-Signature</code> header so you can verify it came from <span class="notranslate">Klea</span>.
          <strong class="text-[var(--foreground)]">Important:</strong> the signature is an HMAC-SHA256 of the transaction's numeric
          <code class="bg-[var(--color-surface)] px-1 rounded">id</code> as a string — <em>not</em> a hash of the request body — using the
          <code class="bg-[var(--color-surface)] px-1 rounded">webhook_secret</code> shown on your application's settings. This differs from most webhook
          signing schemes you may have implemented before, which usually hash the whole payload — get this right or verification will silently fail.
        </p>
        <DocsLanguageTabs :samples="webhookVerifySamples" />
        <p class="text-[var(--muted-foreground)] text-sm mt-3">
          There is no automatic retry today if your endpoint is unreachable or errors — treat delivery as
          best-effort and reconcile against <code class="bg-[var(--color-surface)] px-1 rounded">GET /api/transactions</code> from your dashboard-authenticated session if you need certainty.
        </p>
      </section>

      <section id="errors">
        <h2 class="font-heading text-2xl font-semibold mb-4">Errors</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          Every error response has the shape <code class="bg-[var(--color-surface)] px-1 rounded">{ success: false, message, error? }</code>.
          For field-validation failures (422), <code class="bg-[var(--color-surface)] px-1 rounded">error</code> is an object keyed by field name:
        </p>
        <DocsCodeBlock :code="validationErrorSample" lang="json" />
        <p class="text-sm font-medium text-[var(--foreground)] mt-6 mb-2">Common status codes</p>
        <ul class="space-y-1 text-[var(--muted-foreground)]">
          <li><code class="bg-[var(--color-surface)] px-1 rounded">401</code> — missing, malformed, or invalid/revoked API key</li>
          <li><code class="bg-[var(--color-surface)] px-1 rounded">422</code> — request validation failed, or <code class="bg-[var(--color-surface)] px-1 rounded">plan_id</code> doesn't belong to your application</li>
          <li><code class="bg-[var(--color-surface)] px-1 rounded">500</code> — something failed on our side (including payment-provider errors during subscribe)</li>
        </ul>
      </section>
    </div>
    </div>
  </div>
</template>
