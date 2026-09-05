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
const { t } = useI18n()

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

const sectionDefs = [
  { id: 'quickstart', icon: RocketIcon, key: 'docs.quickstart.title' },
  { id: 'authentication', icon: KeyRoundIcon, key: 'docs.authentication.title' },
  { id: 'environments', icon: FlaskConicalIcon, key: 'docs.environments.title' },
  { id: 'list-plans', icon: ListIcon, key: 'docs.listPlans.title' },
  { id: 'create-subscription', icon: TerminalIcon, key: 'docs.createSubscription.title' },
  { id: 'webhooks', icon: WebhookIcon, key: 'docs.webhooks.title' },
  { id: 'entitlements', icon: ShieldCheckIcon, key: 'docs.entitlements.title' },
  { id: 'enforcing-access', icon: ShieldCheckIcon, key: 'docs.enforcingAccess.title' },
  { id: 'payment-flow', icon: CreditCardIcon, key: 'docs.paymentFlow.title' },
  { id: 'integration-checklist', icon: MapIcon, key: 'docs.integrationChecklist.title' },
  { id: 'pitfalls', icon: AlertTriangleIcon, key: 'docs.pitfalls.title' },
  { id: 'errors', icon: ListChecksIcon, key: 'docs.errors.title' },
]

const sections = computed(() => sectionDefs.map((s) => ({ ...s, label: t(s.key) })))

const filteredSections = computed(() => {
  if (!searchQuery.value.trim()) return sections.value
  const q = searchQuery.value.toLowerCase()
  return sections.value.filter((s) => s.label.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
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
                :placeholder="$t('docs.nav.searchPlaceholder')"
                class="bg-transparent border-none outline-none text-[var(--foreground)] text-sm w-full placeholder:text-[var(--muted-foreground)]"
              />
              <kbd class="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border-dark)] text-[var(--muted-foreground)] font-mono shrink-0">⌘K</kbd>
            </div>
          </div>

          <div class="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] shrink-0">
            <button
              class="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-colors"
              :class="colorMode === 'light' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-accent)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
              :aria-label="$t('nav.lightMode')"
              @click="colorMode = 'light'"
            >
              <SunIcon class="w-4 h-4" />
            </button>
            <button
              class="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-colors"
              :class="colorMode === 'dark' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-accent)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
              :aria-label="$t('nav.darkMode')"
              @click="colorMode = 'dark'"
            >
              <MoonIcon class="w-4 h-4" />
            </button>
            <button
              class="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-colors"
              :class="colorMode === 'auto' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-accent)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
              :aria-label="$t('nav.systemTheme')"
              @click="colorMode = 'auto'"
            >
              <MonitorIcon class="w-4 h-4" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                class="flex items-center justify-center w-[36px] h-[36px] rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer transition-colors shrink-0"
                :aria-label="$t('nav.changeLanguage')"
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
        <p class="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-2 font-medium">{{ $t('docs.nav.contents') }}</p>
        <a
          v-for="s in filteredSections"
          :key="s.id"
          :href="`#${s.id}`"
          class="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer py-1.5 px-2 rounded-md hover:bg-[var(--color-hover)] transition-colors"
        >
          <component :is="s.icon" class="w-4 h-4 text-[var(--color-accent)] shrink-0" />
          <span>{{ s.label }}</span>
        </a>
        <p v-if="filteredSections.length === 0" class="text-xs text-[var(--muted-foreground)] italic px-2 py-1">{{ $t('docs.nav.noMatches') }}</p>
      </div>

      <a
        :href="`${apiBase}/docs/api`"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline cursor-pointer py-1.5 px-2 rounded-md hover:bg-[var(--color-hover)] transition-colors"
      >
        <ExternalLinkIcon class="w-4 h-4 shrink-0" />
        <span>{{ $t('docs.nav.fullApiReference') }}</span>
      </a>
    </nav>

    <div class="space-y-16 text-[var(--foreground)] overflow-y-auto py-10">
      <section>
        <p class="text-xs uppercase tracking-wide text-[var(--color-accent)] mb-2">{{ $t('docs.page.eyebrow') }}</p>
        <h1 class="font-heading text-3xl font-bold mb-4">
          <i18n-t keypath="docs.page.title" tag="span">
            <template #brand><span class="notranslate">Klea</span></template>
          </i18n-t>
        </h1>
        <p class="text-[var(--muted-foreground)]">
          <i18n-t keypath="docs.page.intro" tag="span">
            <template #brand><span class="notranslate">Klea</span></template>
          </i18n-t>
        </p>
      </section>

      <section id="quickstart">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.quickstart.title') }}</h2>
        <ol class="list-decimal list-inside space-y-2 text-[var(--muted-foreground)]">
          <li>
            <i18n-t keypath="docs.quickstart.step1" tag="span">
              <template #link>
                <NuxtLink to="/signup" class="text-[var(--color-accent)] hover:underline">
                  <i18n-t keypath="docs.quickstart.step1LinkText" tag="span">
                    <template #brand><span class="notranslate">Klea</span></template>
                  </i18n-t>
                </NuxtLink>
              </template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.quickstart.step2" tag="span">
              <template #application><strong class="text-[var(--foreground)]">{{ $t('docs.terms.application') }}</strong></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.quickstart.step3" tag="span">
              <template #apiKey><strong class="text-[var(--foreground)]">{{ $t('docs.terms.apiKey') }}</strong></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.quickstart.step4" tag="span">
              <template #plan><strong class="text-[var(--foreground)]">{{ $t('docs.terms.plan') }}</strong></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.quickstart.step5" tag="span">
              <template #listPlansLink><a href="#list-plans" class="text-[var(--color-accent)] hover:underline">{{ $t('docs.listPlans.title') }}</a></template>
              <template #createSubscriptionLink><a href="#create-subscription" class="text-[var(--color-accent)] hover:underline">{{ $t('docs.createSubscription.title') }}</a></template>
            </i18n-t>
          </li>
        </ol>
      </section>

      <section id="authentication">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.authentication.title') }}</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          <i18n-t keypath="docs.authentication.para1" tag="span">
            <template #idFormat><code class="bg-[var(--color-surface)] px-1 rounded">{public_id}.{secret}</code></template>
            <template #apiKeysTab><strong class="text-[var(--foreground)]">{{ $t('docs.terms.apiKeyPlural') }}</strong></template>
          </i18n-t>
        </p>
        <p class="text-[var(--muted-foreground)] mb-4">
          <i18n-t keypath="docs.authentication.para2" tag="span">
            <template #envFile><code class="bg-[var(--color-surface)] px-1 rounded">.env</code></template>
          </i18n-t>
        </p>
        <DocsCodeBlock :code="keyFormatSample" lang="bash" />
        <p class="text-[var(--muted-foreground)] text-sm mb-4">
          {{ $t('docs.authentication.para3') }}
        </p>
        <DocsCodeBlock
          code="Authorization: Bearer {public_id}.{secret}"
          lang="bash"
        />
      </section>

      <section id="environments">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.environments.title') }}</h2>
        <p class="text-[var(--muted-foreground)]">
          <i18n-t keypath="docs.environments.body" tag="span">
            <template #envField><code class="bg-[var(--color-surface)] px-1 rounded">environment</code></template>
            <template #testValue><code class="bg-[var(--color-surface)] px-1 rounded">test</code></template>
            <template #liveValue><code class="bg-[var(--color-surface)] px-1 rounded">live</code></template>
            <template #notEnforced><strong class="text-[var(--foreground)]">{{ $t('docs.environments.notEnforced') }}</strong></template>
          </i18n-t>
        </p>
      </section>

      <section id="list-plans">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.listPlans.title') }}</h2>
        <p class="text-[var(--muted-foreground)] mb-1">
          <i18n-t keypath="docs.listPlans.intro" tag="span">
            <template #endpoint><code class="bg-[var(--color-surface)] px-1 rounded">GET /api/public/plans</code></template>
          </i18n-t>
        </p>
        <DocsLanguageTabs :samples="listPlansSamples" />
        <p class="text-sm font-medium text-[var(--foreground)] mt-6 mb-1">{{ $t('docs.common.responseStatus', { status: 200 }) }}</p>
        <DocsCodeBlock :code="listPlansResponse" lang="json" />
      </section>

      <section id="create-subscription">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.createSubscription.title') }}</h2>
        <p class="text-[var(--muted-foreground)] mb-1">
          <i18n-t keypath="docs.createSubscription.intro" tag="span">
            <template #endpoint><code class="bg-[var(--color-surface)] px-1 rounded">POST /api/public/subscribe</code></template>
          </i18n-t>
        </p>

        <table class="w-full text-sm mt-4 mb-6 border border-[var(--color-border-dark)] rounded-lg overflow-hidden bg-[var(--color-bg)]">
          <thead class="bg-[var(--color-surface)] text-[var(--muted-foreground)]">
            <tr>
              <th class="text-left font-medium px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.field') }}</th>
              <th class="text-left font-medium px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.type') }}</th>
              <th class="text-left font-medium px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.required') }}</th>
              <th class="text-left font-medium px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.notes') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--color-border-dark)] text-[var(--muted-foreground)]">
            <tr>
              <td class="px-4 py-2 font-mono text-xs text-[var(--foreground)]">plan_id</td>
              <td class="px-4 py-2">integer</td>
              <td class="px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.yes') }}</td>
              <td class="px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.notePlanId') }}</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-xs text-[var(--foreground)]">external_id</td>
              <td class="px-4 py-2">string</td>
              <td class="px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.yes') }}</td>
              <td class="px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.noteExternalId') }}</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-xs text-[var(--foreground)]">phone_number</td>
              <td class="px-4 py-2">string</td>
              <td class="px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.yes') }}</td>
              <td class="px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.notePhoneNumber') }}</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-xs text-[var(--foreground)]">email</td>
              <td class="px-4 py-2">string</td>
              <td class="px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.no') }}</td>
              <td class="px-4 py-2">&nbsp;</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-xs text-[var(--foreground)]">environment</td>
              <td class="px-4 py-2">"test" | "live"</td>
              <td class="px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.no') }}</td>
              <td class="px-4 py-2">{{ $t('docs.createSubscription.fieldsTable.noteEnvironment', { section: $t('docs.environments.title') }) }}</td>
            </tr>
          </tbody>
        </table>

        <DocsLanguageTabs :samples="subscribeSamples" />
        <p class="text-sm font-medium text-[var(--foreground)] mt-6 mb-1">{{ $t('docs.common.responseStatus', { status: 201 }) }}</p>
        <DocsCodeBlock :code="subscribeResponse" lang="json" />
        <p class="text-[var(--muted-foreground)] text-sm mt-3">
          <i18n-t keypath="docs.createSubscription.responseNote" tag="span">
            <template #paymentUrl><code class="bg-[var(--color-surface)] px-1 rounded">data.payment_url</code></template>
            <template #qrcodeUrl><code class="bg-[var(--color-surface)] px-1 rounded">data.qrcode_url</code></template>
            <template #nullVal><code class="bg-[var(--color-surface)] px-1 rounded">null</code></template>
            <template #pendingVal><code class="bg-[var(--color-surface)] px-1 rounded">pending</code></template>
          </i18n-t>
        </p>
      </section>

      <section id="webhooks">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.webhooks.title') }}</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          <i18n-t keypath="docs.webhooks.intro" tag="span">
            <template #webhookUrlLabel><strong class="text-[var(--foreground)]">{{ $t('docs.terms.webhookUrl') }}</strong></template>
            <template #brand><span class="notranslate">Klea</span></template>
            <template #postMethod><code class="bg-[var(--color-surface)] px-1 rounded">POST</code></template>
            <template #eventName><code class="bg-[var(--color-surface)] px-1 rounded">subscription.payment_result</code></template>
          </i18n-t>
        </p>
        <p class="text-sm font-medium text-[var(--foreground)] mb-1">{{ $t('docs.webhooks.payloadLabel') }}</p>
        <DocsCodeBlock :code="webhookPayload" lang="json" />

        <p class="text-[var(--muted-foreground)] mt-6 mb-1">
          <i18n-t keypath="docs.webhooks.verify" tag="span">
            <template #sigHeader><code class="bg-[var(--color-surface)] px-1 rounded">X-Klea-Signature</code></template>
            <template #brand><span class="notranslate">Klea</span></template>
            <template #important><strong class="text-[var(--foreground)]">{{ $t('docs.webhooks.important') }}</strong></template>
            <template #idField><code class="bg-[var(--color-surface)] px-1 rounded">id</code></template>
            <template #notWord><em>{{ $t('docs.webhooks.notWord') }}</em></template>
            <template #secretField><code class="bg-[var(--color-surface)] px-1 rounded">webhook_secret</code></template>
          </i18n-t>
        </p>
        <DocsLanguageTabs :samples="webhookVerifySamples" />
        <p class="text-[var(--muted-foreground)] text-sm mt-3">
          <i18n-t keypath="docs.webhooks.retryNote" tag="span">
            <template #transactionsEndpoint><code class="bg-[var(--color-surface)] px-1 rounded">GET /api/transactions</code></template>
          </i18n-t>
        </p>
      </section>

      <section id="entitlements">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.entitlements.title') }}</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          <i18n-t keypath="docs.entitlements.intro" tag="span">
            <template #externalId><code class="bg-[var(--color-surface)] px-1 rounded">external_id</code></template>
          </i18n-t>
        </p>
        <DocsCodeBlock lang="sql" :code="entitlementsTableSample" />
        <p class="text-[var(--muted-foreground)] text-sm mt-3 mb-2">{{ $t('docs.entitlements.detailsIntro') }}</p>
        <ul class="list-disc list-inside space-y-2 text-[var(--muted-foreground)] text-sm">
          <li>
            <i18n-t keypath="docs.entitlements.detail1" tag="span">
              <template #lead><strong class="text-[var(--foreground)]">{{ $t('docs.entitlements.detail1Lead') }}</strong></template>
              <template #billingPeriod><code class="bg-[var(--color-surface)] px-1 rounded">billing_period</code></template>
              <template #oneTime><code class="bg-[var(--color-surface)] px-1 rounded">one_time</code></template>
              <template #durationDays><code class="bg-[var(--color-surface)] px-1 rounded">duration_days</code></template>
              <template #nullVal><code class="bg-[var(--color-surface)] px-1 rounded">null</code></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.entitlements.detail2" tag="span">
              <template #lead><strong class="text-[var(--foreground)]">{{ $t('docs.entitlements.detail2Lead') }}</strong></template>
              <template #featuresField><code class="bg-[var(--color-surface)] px-1 rounded">features</code></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.entitlements.detail3" tag="span">
              <template #lead><strong class="text-[var(--foreground)]">{{ $t('docs.entitlements.detail3Lead') }}</strong></template>
            </i18n-t>
          </li>
        </ul>
      </section>

      <section id="enforcing-access">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.enforcingAccess.title') }}</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          {{ $t('docs.enforcingAccess.intro') }}
        </p>
        <DocsCodeBlock lang="php" :code="featureGateSample" />
        <p class="text-[var(--muted-foreground)] text-sm mt-4 mb-2">
          {{ $t('docs.enforcingAccess.conventionsIntro') }}
        </p>
        <ul class="list-disc list-inside space-y-2 text-[var(--muted-foreground)] text-sm">
          <li>
            <i18n-t keypath="docs.enforcingAccess.rule1" tag="span">
              <template #lead>
                <strong class="text-[var(--foreground)]">
                  <i18n-t keypath="docs.enforcingAccess.rule1Lead" tag="span">
                    <template #nullVal><code class="bg-[var(--color-surface)] px-1 rounded">null</code></template>
                  </i18n-t>
                </strong>
              </template>
              <template #limitNull><code class="bg-[var(--color-surface)] px-1 rounded">limit: null</code></template>
              <template #zero><code class="bg-[var(--color-surface)] px-1 rounded">0</code></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.enforcingAccess.rule2" tag="span">
              <template #lead><strong class="text-[var(--foreground)]">{{ $t('docs.enforcingAccess.rule2Lead') }}</strong></template>
            </i18n-t>
          </li>
        </ul>
        <p class="text-[var(--muted-foreground)] text-sm mt-4">
          {{ $t('docs.enforcingAccess.upgradeIntro') }}
        </p>
        <DocsCodeBlock lang="json" :code="upgradeRequiredSample" />
      </section>

      <section id="payment-flow">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.paymentFlow.title') }}</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          <i18n-t keypath="docs.paymentFlow.intro" tag="span">
            <template #endpoint><code class="bg-[var(--color-surface)] px-1 rounded">POST /public/subscribe</code></template>
            <template #paymentUrlField><code class="bg-[var(--color-surface)] px-1 rounded">payment_url</code></template>
          </i18n-t>
        </p>
        <p class="text-[var(--muted-foreground)] text-sm mb-2">
          <i18n-t keypath="docs.paymentFlow.gatewaysIntro" tag="span">
            <template #gatewaysEndpoint><code class="bg-[var(--color-surface)] px-1 rounded">GET /public/gateways</code></template>
            <template #idField><code class="bg-[var(--color-surface)] px-1 rounded">id</code></template>
            <template #gatewayIdField><code class="bg-[var(--color-surface)] px-1 rounded">gateway_id</code></template>
          </i18n-t>
        </p>
        <DocsCodeBlock lang="json" :code="gatewaysResponseSample" />
        <p class="text-[var(--muted-foreground)] text-sm mt-4 mb-2">
          <i18n-t keypath="docs.paymentFlow.returnUrl" tag="span">
            <template #returnUrlLabel><strong class="text-[var(--foreground)]">{{ $t('docs.terms.returnUrl') }}</strong></template>
            <template #notProof><strong class="text-[var(--foreground)]">{{ $t('docs.paymentFlow.notProof') }}</strong></template>
          </i18n-t>
        </p>
        <DocsCodeBlock lang="javascript" :code="pollingSample" />
        <p class="text-[var(--muted-foreground)] text-sm mt-3">
          {{ $t('docs.paymentFlow.channelsNote') }}
        </p>
      </section>

      <section id="integration-checklist">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.integrationChecklist.title') }}</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          {{ $t('docs.integrationChecklist.intro') }}
        </p>
        <ol class="list-decimal list-inside space-y-2 text-[var(--muted-foreground)] text-sm">
          <li>
            <i18n-t keypath="docs.integrationChecklist.step1" tag="span">
              <template #application><strong class="text-[var(--foreground)]">{{ $t('docs.terms.application') }}</strong></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.integrationChecklist.step2" tag="span">
              <template #features><strong class="text-[var(--foreground)]">{{ $t('docs.terms.features') }}</strong></template>
              <template #codeField><code class="bg-[var(--color-surface)] px-1 rounded">code</code></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.integrationChecklist.step3" tag="span">
              <template #plans><strong class="text-[var(--foreground)]">{{ $t('docs.terms.plans') }}</strong></template>
              <template #active><strong class="text-[var(--foreground)]">{{ $t('docs.integrationChecklist.step3Active') }}</strong></template>
              <template #plansEndpoint><code class="bg-[var(--color-surface)] px-1 rounded">GET /public/plans</code></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.integrationChecklist.step4" tag="span">
              <template #apiKey><strong class="text-[var(--foreground)]">{{ $t('docs.terms.apiKey') }}</strong></template>
              <template #webhookUrl><strong class="text-[var(--foreground)]">{{ $t('docs.terms.webhookUrl') }}</strong></template>
            </i18n-t>
          </li>
          <li>{{ $t('docs.integrationChecklist.step5') }}</li>
          <li>
            <i18n-t keypath="docs.integrationChecklist.step6" tag="span">
              <template #plansEndpoint><code class="bg-[var(--color-surface)] px-1 rounded">GET /public/plans</code></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.integrationChecklist.step7" tag="span">
              <template #subscribeEndpoint><code class="bg-[var(--color-surface)] px-1 rounded">/public/subscribe</code></template>
            </i18n-t>
          </li>
          <li>{{ $t('docs.integrationChecklist.step8') }}</li>
          <li>{{ $t('docs.integrationChecklist.step9') }}</li>
        </ol>
      </section>

      <section id="pitfalls">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.pitfalls.title') }}</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          {{ $t('docs.pitfalls.intro') }}
        </p>
        <div class="space-y-4">
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">{{ $t('docs.pitfalls.item1.title') }}</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              <i18n-t keypath="docs.pitfalls.item1.desc" tag="span">
                <template #plansEndpoint><code class="bg-[var(--color-surface)] px-1 rounded">GET /public/plans</code></template>
                <template #active><strong class="text-[var(--foreground)]">{{ $t('docs.pitfalls.item1Active') }}</strong></template>
              </i18n-t>
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">{{ $t('docs.pitfalls.item2.title') }}</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              <i18n-t keypath="docs.pitfalls.item2.desc" tag="span">
                <template #transactionId><code class="bg-[var(--color-surface)] px-1 rounded">transaction.id</code></template>
                <template #hashEquals><code class="bg-[var(--color-surface)] px-1 rounded">hash_equals</code></template>
                <template #tripleEquals><code class="bg-[var(--color-surface)] px-1 rounded">{{ '===' }}</code></template>
              </i18n-t>
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">{{ $t('docs.pitfalls.item3.title') }}</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              {{ $t('docs.pitfalls.item3.desc') }}
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">{{ $t('docs.pitfalls.item4.title') }}</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              <i18n-t keypath="docs.pitfalls.item4.desc" tag="span">
                <template #pendingWord><em>pending</em></template>
              </i18n-t>
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">{{ $t('docs.pitfalls.item5.title') }}</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              {{ $t('docs.pitfalls.item5.desc') }}
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">{{ $t('docs.pitfalls.item6.title') }}</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              {{ $t('docs.pitfalls.item6.desc') }}
            </p>
          </div>
          <div class="border border-[var(--color-border-dark)] rounded-lg p-4">
            <p class="font-medium text-[var(--foreground)] mb-1">{{ $t('docs.pitfalls.item7.title') }}</p>
            <p class="text-[var(--muted-foreground)] text-sm">
              <i18n-t keypath="docs.pitfalls.item7.desc" tag="span">
                <template #limitOne><code class="bg-[var(--color-surface)] px-1 rounded">limit: 1</code></template>
              </i18n-t>
            </p>
          </div>
        </div>
      </section>

      <section id="errors">
        <h2 class="font-heading text-2xl font-semibold mb-4">{{ $t('docs.errors.title') }}</h2>
        <p class="text-[var(--muted-foreground)] mb-4">
          <i18n-t keypath="docs.errors.intro" tag="span">
            <template #shape><code class="bg-[var(--color-surface)] px-1 rounded">{ success: false, message, error? }</code></template>
            <template #errorField><code class="bg-[var(--color-surface)] px-1 rounded">error</code></template>
          </i18n-t>
        </p>
        <DocsCodeBlock :code="validationErrorSample" lang="json" />
        <p class="text-sm font-medium text-[var(--foreground)] mt-6 mb-2">{{ $t('docs.errors.statusCodesLabel') }}</p>
        <ul class="space-y-1 text-[var(--muted-foreground)]">
          <li>
            <i18n-t keypath="docs.errors.code401" tag="span">
              <template #code><code class="bg-[var(--color-surface)] px-1 rounded">401</code></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.errors.code422" tag="span">
              <template #code><code class="bg-[var(--color-surface)] px-1 rounded">422</code></template>
              <template #planId><code class="bg-[var(--color-surface)] px-1 rounded">plan_id</code></template>
            </i18n-t>
          </li>
          <li>
            <i18n-t keypath="docs.errors.code500" tag="span">
              <template #code><code class="bg-[var(--color-surface)] px-1 rounded">500</code></template>
            </i18n-t>
          </li>
        </ul>
      </section>
    </div>
    </div>
  </div>
</template>
