<!-- app/pages/docs.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'default' })
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RocketIcon, KeyRoundIcon, FlaskConicalIcon, ListIcon, TerminalIcon, WebhookIcon, ListChecksIcon, SearchIcon, MoonIcon, SunIcon, ExternalLinkIcon, MonitorIcon, LanguagesIcon, ShieldCheckIcon, CreditCardIcon, MapIcon, AlertTriangleIcon } from '@lucide/vue'
import DocsCodeBlock from '~/components/Docs/CodeBlock.vue'
import DocsLanguageTabs from '~/components/Docs/LanguageTabs.vue'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'

const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl

const router = useRouter()
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const { colorMode } = useTheme()
const { availableLocales, setLocale } = useLocale()

function changeLanguage(code: string) {
  setLocale(code)
}

// Where "back" should go depends on how the reader arrived. Someone who came
// from the dashboard expects to return there, not to the marketing site. The
// referring route is captured once on mount (it's gone after any in-page
// navigation) and remembered for the session so a refresh doesn't lose it.
const DOCS_ORIGIN_KEY = 'klea_docs_origin'
const backTarget = ref('/')

const resolveBackTarget = () => {
  const previous = router.options.history.state?.back
  const remembered = sessionStorage.getItem(DOCS_ORIGIN_KEY)

  // A dashboard path always looks like /<workspace>/<section>; the landing
  // page, auth pages and docs itself never do.
  const cameFromApp = typeof previous === 'string'
    && /^\/[^/]+\/(dashboard|apps|earnings|team|settings)/.test(previous)

  if (cameFromApp) {
    sessionStorage.setItem(DOCS_ORIGIN_KEY, previous as string)
    backTarget.value = previous as string
    return
  }

  // Direct visit or refresh: fall back to whatever we recorded earlier.
  if (remembered && !previous) {
    backTarget.value = remembered
    return
  }

  if (previous) sessionStorage.removeItem(DOCS_ORIGIN_KEY)
  backTarget.value = '/'
}

const sections = [
  { id: 'quickstart', icon: RocketIcon, label: 'Quickstart' },
  { id: 'authentication', icon: KeyRoundIcon, label: 'Authentication' },
  { id: 'environments', icon: FlaskConicalIcon, label: 'Test vs Live' },
  { id: 'list-plans', icon: ListIcon, label: 'List plans' },
  { id: 'create-subscription', icon: TerminalIcon, label: 'Create a subscription' },
  { id: 'webhooks', icon: WebhookIcon, label: 'Webhooks' },
  { id: 'entitlements', icon: ShieldCheckIcon, label: 'Storing entitlements' },
  { id: 'enforcing-access', icon: ShieldCheckIcon, label: 'Enforcing access' },
  { id: 'payment-flow', icon: CreditCardIcon, label: 'Payment flow & UX' },
  { id: 'integration-checklist', icon: MapIcon, label: 'Integration checklist' },
  { id: 'pitfalls', icon: AlertTriangleIcon, label: 'Common pitfalls' },
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
  resolveBackTarget()
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
      "billing_period": "monthly",
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

const keyFormatSample = `# Test mode
pk_test_<your_public_id>.sk_test_<your_secret>

# Live mode
pk_live_<your_public_id>.sk_live_<your_secret>`

const entitlementsTableSample = `CREATE TABLE customer_entitlements (
  id                BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id       VARCHAR(255) NOT NULL UNIQUE,  -- what you sent as external_id
  klea_plan_id      BIGINT NULL,
  plan_name         VARCHAR(255) NULL,             -- denormalised, for display
  status            VARCHAR(32) NOT NULL,          -- pending|active|failed|expired
  features          JSON NULL,                     -- snapshot from the webhook
  expires_at        TIMESTAMP NULL,                -- YOU compute this
  last_transaction_id BIGINT NULL,                 -- guards against replays
  updated_at        TIMESTAMP NULL
);`

const featureGateSample = `// One place decides what a customer may do.
class FeatureGate
{
    /** Numeric quota, or null when unlimited. */
    public function limit(string $customerId, string $code): ?int
    {
        $ent = $this->activeEntitlement($customerId);

        // No subscription (or expired) -> your own free tier.
        if (! $ent) {
            return config("entitlements.free.{$code}");
        }

        $feature = collect($ent->features)->firstWhere('code', $code);

        // null here means UNLIMITED, so return it as-is.
        return $feature ? $feature['limit'] : config("entitlements.free.{$code}");
    }

    private function activeEntitlement(string $customerId)
    {
        $ent = CustomerEntitlement::where('customer_id', $customerId)->first();

        // Expiry is what ends access — a failed renewal alone never does.
        return $ent && $ent->status === 'active' && $ent->expires_at?->isFuture()
            ? $ent
            : null;
    }
}

// At the call site, skip the check entirely when the limit is null.
$limit = $gate->limit($customerId, 'max_projects');

if ($limit !== null && $currentCount >= $limit) {
    return response()->json([
        'upgrade_required' => true,
        'feature' => 'max_projects',
    ], 422);
}`

const upgradeRequiredSample = `{
  "success": false,
  "upgrade_required": true,
  "feature": "max_projects",
  "message": "You've reached the project limit for your plan."
}`

const gatewaysResponseSample = `GET /api/public/gateways

{
  "data": [
    {
      "id": 1,
      "reference": "016eb63c-f29d-4384-92e4-b1bd37ef69f8",
      "libelle": "FloozTG-Ecom",
      "psp": { "libelle": "FLOOZ", "logo_url": "https://.../Flooz.png" },
      "methode": "PUSH_USSD"
    }
  ],
  "success": true
}

// Then, optionally, on POST /public/subscribe:
{ "plan_id": 2, "external_id": "org_123", "gateway_id": 1 }`

const pollingSample = `// No redirect comes back from the payment page, so watch your own
// entitlement endpoint and stop once the webhook has activated it.
const result = await subscribe(planId, phoneNumber, gatewayId)
window.open(result.payment_url, '_blank')

const timer = setInterval(async () => {
  const entitlement = await getEntitlement(customerId)

  if (entitlement.status === 'active') {
    clearInterval(timer)
    showSuccess()
  }
}, 5000)

// Always clear the interval when the component unmounts, or it keeps
// firing requests after the user has navigated away.`

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
        <NuxtLink :to="backTarget" class="notranslate font-heading font-bold text-xl tracking-tight text-[var(--foreground)] flex items-center cursor-pointer select-none">
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
              >
                {{ l.name }} ({{ l.code.toUpperCase() }})
              </DropdownMenuItem>
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
        <p class="text-[var(--muted-foreground)] mb-4">
          Both halves carry an environment prefix, so you can tell at a glance which mode a key belongs to —
          in a <code class="bg-[var(--color-surface)] px-1 rounded">.env</code> file, a log line, or a support
          request — without looking it up:
        </p>
        <DocsCodeBlock :code="keyFormatSample" lang="bash" />
        <p class="text-[var(--muted-foreground)] text-sm mb-4">
          Send the token exactly as issued, prefixes included — they are part of the credential, not decoration.
          The environment is taken from the key itself, so a test key can only ever create test data.
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

      <section id="entitlements">
        <h2 class="font-heading text-2xl font-semibold mb-4">Storing entitlements</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          Klea has no "is this customer subscribed?" endpoint, and you should not call the API on every
          request anyway. Instead, keep a small table in your own database that the webhook writes to and
          the rest of your app reads from. One row per customer (the entity you sent as
          <code class="bg-[var(--color-surface)] px-1 rounded">external_id</code>).
        </p>
        <DocsCodeBlock lang="sql" :code="entitlementsTableSample" />
        <p class="text-[var(--muted-foreground)] text-sm mt-3 mb-2">Three details that are easy to get wrong:</p>
        <ul class="list-disc list-inside space-y-2 text-[var(--muted-foreground)] text-sm">
          <li>
            <strong class="text-[var(--foreground)]">Compute the expiry yourself.</strong> The webhook has no
            expiry field. Check <code class="bg-[var(--color-surface)] px-1 rounded">billing_period</code> on the
            plan: for <code class="bg-[var(--color-surface)] px-1 rounded">one_time</code> there is no expiry (the
            customer keeps access forever); for every other period, take
            <code class="bg-[var(--color-surface)] px-1 rounded">duration_days</code> (a plain integer number of
            days — it is <code class="bg-[var(--color-surface)] px-1 rounded">null</code> only for
            <code class="bg-[var(--color-surface)] px-1 rounded">one_time</code>) and add it to "now" when the
            payment succeeds.
          </li>
          <li>
            <strong class="text-[var(--foreground)]">Store the feature snapshot verbatim.</strong> Persist the
            <code class="bg-[var(--color-surface)] px-1 rounded">features</code> array from the webhook as JSON.
            Reading limits from a live API call on every request is slow and breaks when Klea is unreachable.
          </li>
          <li>
            <strong class="text-[var(--foreground)]">A failed renewal must not revoke access.</strong> If a
            payment fails while the customer still has a valid paid period, leave the active row alone. Only
            expiry ends access.
          </li>
        </ul>
      </section>

      <section id="enforcing-access">
        <h2 class="font-heading text-2xl font-semibold mb-4">Enforcing access</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          Put every check behind one function so there is a single place that decides what a customer may do.
          Read from your local table, never from the API.
        </p>
        <DocsCodeBlock lang="php" :code="featureGateSample" />
        <p class="text-[var(--muted-foreground)] text-sm mt-4 mb-2">
          Two conventions worth adopting, because they remove whole classes of bug:
        </p>
        <ul class="list-disc list-inside space-y-2 text-[var(--muted-foreground)] text-sm">
          <li>
            <strong class="text-[var(--foreground)]">Treat <code class="bg-[var(--color-surface)] px-1 rounded">null</code>
            as unlimited, never as zero.</strong> A plan with an unlimited quota stores
            <code class="bg-[var(--color-surface)] px-1 rounded">limit: null</code>. Reading that as
            <code class="bg-[var(--color-surface)] px-1 rounded">0</code> blocks your best-paying customers.
          </li>
          <li>
            <strong class="text-[var(--foreground)]">Define a free tier in config.</strong> Customers with no
            subscription should fall back to it, so a missing row is a normal state rather than an error.
          </li>
        </ul>
        <p class="text-[var(--muted-foreground)] text-sm mt-4">
          Return a distinguishable response when a limit is hit, so the frontend can prompt an upgrade instead of
          showing a generic failure:
        </p>
        <DocsCodeBlock lang="json" :code="upgradeRequiredSample" />
      </section>

      <section id="payment-flow">
        <h2 class="font-heading text-2xl font-semibold mb-4">Payment flow &amp; UX</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          <code class="bg-[var(--color-surface)] px-1 rounded">POST /public/subscribe</code> returns a
          <code class="bg-[var(--color-surface)] px-1 rounded">payment_url</code> — a hosted page where the
          customer completes payment. Card details are entered there and never touch your servers, which keeps
          you out of PCI-DSS scope. Do not build your own card form; there is no field to send one.
        </p>
        <p class="text-[var(--muted-foreground)] text-sm mb-2">
          Optionally let the customer pick a channel first. <code class="bg-[var(--color-surface)] px-1 rounded">GET /public/gateways</code>
          returns the live list with logos; pass the chosen
          <code class="bg-[var(--color-surface)] px-1 rounded">id</code> as
          <code class="bg-[var(--color-surface)] px-1 rounded">gateway_id</code> and the hosted page opens on it.
          Omit it and the customer chooses there instead.
        </p>
        <DocsCodeBlock lang="json" :code="gatewaysResponseSample" />
        <p class="text-[var(--muted-foreground)] text-sm mt-4 mb-2">
          Set a <strong class="text-[var(--foreground)]">Return URL</strong> on your application (Settings →
          Return URL) and we send the customer's browser back there after they pay. But
          <strong class="text-[var(--foreground)]">arriving there does not prove the payment succeeded</strong>
          — a customer can land on it by cancelling or pressing back. The webhook is the only trustworthy
          signal. So send them somewhere that polls your own entitlement endpoint until it flips to active:
        </p>
        <DocsCodeBlock lang="javascript" :code="pollingSample" />
        <p class="text-[var(--muted-foreground)] text-sm mt-3">
          Mobile-money channels debit a wallet, so collect a phone number for those. Card channels need none —
          asking for one there just adds friction.
        </p>
      </section>

      <section id="integration-checklist">
        <h2 class="font-heading text-2xl font-semibold mb-4">Integration checklist</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          A complete integration, in dependency order. Steps 1–4 are dashboard setup; the rest is code.
        </p>
        <ol class="list-decimal list-inside space-y-2 text-[var(--muted-foreground)] text-sm">
          <li>Create an <strong class="text-[var(--foreground)]">Application</strong> for the app you're integrating.</li>
          <li>Create <strong class="text-[var(--foreground)]">Features</strong>, and write the
            <code class="bg-[var(--color-surface)] px-1 rounded">code</code> values down — they are the contract
            your app reads, so they must match exactly.</li>
          <li>Create <strong class="text-[var(--foreground)]">Plans</strong> and attach features with their limits.
            Leave a limit empty for "unlimited". Make sure each plan is <strong class="text-[var(--foreground)]">active</strong>,
            or it won't appear in <code class="bg-[var(--color-surface)] px-1 rounded">GET /public/plans</code>.</li>
          <li>Generate an <strong class="text-[var(--foreground)]">API key</strong> (shown once) and set the
            <strong class="text-[var(--foreground)]">webhook URL</strong> — saving it generates the signing secret.
            Copy both into your app's environment; never into frontend code.</li>
          <li>Create your entitlements table and the webhook receiver. Verify the signature before trusting anything.</li>
          <li>Build the pricing page from <code class="bg-[var(--color-surface)] px-1 rounded">GET /public/plans</code>
            rather than hardcoding prices.</li>
          <li>Add a checkout page that calls <code class="bg-[var(--color-surface)] px-1 rounded">/public/subscribe</code>,
            opens the payment URL, and polls for activation.</li>
          <li>Route every limit check through your feature gate.</li>
          <li>Test the full path with a real payment in test mode before going live.</li>
        </ol>
      </section>

      <section id="pitfalls">
        <h2 class="font-heading text-2xl font-semibold mb-4">Common pitfalls</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          Each of these has cost a real integration time. They're listed roughly in the order you'll hit them.
        </p>
        <div class="space-y-4">
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">Plans exist but the API returns none</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              <code class="bg-[var(--color-surface)] px-1 rounded">GET /public/plans</code> only returns
              <strong class="text-[var(--foreground)]">active</strong> plans. A plan left as a draft is invisible
              to your app with no error to explain why.
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">The signature covers the transaction id, not the body</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              Most webhook APIs sign the whole payload. This one signs
              <code class="bg-[var(--color-surface)] px-1 rounded">transaction.id</code> only. Verifying against the
              JSON body will reject every delivery. Compare with
              <code class="bg-[var(--color-surface)] px-1 rounded">hash_equals</code>, not
              <code class="bg-[var(--color-surface)] px-1 rounded">{{ '===' }}</code>.
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">An unset webhook secret fails open</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              If your secret is empty, an HMAC computed with an empty key is one anybody can reproduce — so any
              forged request would be accepted. Reject webhooks outright when the secret is missing, rather than
              computing a signature with a blank one.
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">Starting a new payment revokes the current plan</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              If you set the entitlement to <em>pending</em> when checkout starts, a customer who abandons payment
              loses the plan they already paid for. Only downgrade when there is nothing active to protect.
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">Webhooks are not retried</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              If your endpoint is down when a payment settles, that notification is gone. Show pending payments as
              "awaiting confirmation" rather than failed, and reconcile from your dashboard if needed.
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">Caching a typed object breaks on the second call</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              Caching a framework collection in a serializing store (database, Redis, file) hands back an
              incomplete object on a cache hit. The first request works and every later one fails. Cache plain
              arrays and re-wrap them after reading.
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">Boolean features rendered as numbers</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              An on/off feature may carry <code class="bg-[var(--color-surface)] px-1 rounded">limit: 1</code>,
              which renders as "Advanced analytics: 1" if you print limits blindly. Only show a number for quota
              features.
            </p>
          </div>
        </div>
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
