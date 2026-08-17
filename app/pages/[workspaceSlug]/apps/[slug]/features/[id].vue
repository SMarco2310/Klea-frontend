<!-- app/pages/apps/[slug]/features/[id].vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { ArrowLeftIcon, CodeIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import AppHeader from '~/components/dashboard/AppHeader.vue'
import DocsLanguageTabs from '~/components/Docs/LanguageTabs.vue'
import { toast } from 'vue-sonner'

const route = useRoute()
const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)

const isNew = computed(() => route.params.id === 'new')
const featureId = computed(() => isNew.value ? null : Number(route.params.id))

const { features, pending, fetchFeatures, createFeature, updateFeature } = useFeatures(appId.value)

const name = ref('')
const key = ref('')
const description = ref('')
const isSaving = ref(false)
const errorMessage = ref('')
const isInitialized = ref(false)

watchEffect(() => {
  if (appId.value && !isInitialized.value && !isNew.value) {
    if (features.value.length === 0) {
      fetchFeatures()
    }
  }
})

watchEffect(() => {
  if (!isNew.value && features.value.length > 0 && !isInitialized.value) {
    const existing = features.value.find(f => f.id === featureId.value)
    if (existing) {
      name.value = existing.name || ''
      key.value = existing.code || ''
      description.value = existing.description || ''
      isInitialized.value = true
    } else if (!pending.value) {
      // Not found
      navigateTo(`/${route.params.workspaceSlug}/apps/${route.params.slug}/features`)
    }
  }
})

function slugifyKey(v: string) {
  return v.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

async function handleSave() {
  const cleanKey = slugifyKey(key.value)
  if (!cleanKey) return
  const featureName = name.value.trim() || cleanKey

  isSaving.value = true
  errorMessage.value = ''
  try {
    if (!isNew.value && featureId.value) {
      await updateFeature(featureId.value, {
        name: featureName,
        code: cleanKey,
        description: description.value.trim(),
      })
      toast.success('Feature updated successfully')
    } else {
      await createFeature({
        name: featureName,
        code: cleanKey,
        description: description.value.trim(),
      })
      toast.success('Feature created successfully')
    }
    navigateTo(`/${route.params.workspaceSlug}/apps/${route.params.slug}/features`)
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isSaving.value = false
  }
}

const codeSamples = computed(() => {
  const featureCode = slugifyKey(key.value) || 'feature_code'
  const featureTitle = name.value.trim() || 'the feature'
  return {
    JavaScript: {
      lang: 'javascript',
      code: `// 1. Fetch the user's active subscription from your DB
const subscription = await getUserSubscription(userId)

// 2. Check if the subscription includes this feature
const hasFeature = subscription.features.some(
  (f) => f.code === '${featureCode}'
)

if (hasFeature) {
  // Allow access to ${featureTitle}
  enableFeature()
} else {
  // Show upgrade prompt
  promptUpgrade()
}`
    },
    PHP: {
      lang: 'php',
      code: `// 1. Get the user's active subscription
$subscription = $user->activeSubscription();

// 2. Check if the subscription includes this feature
$hasFeature = collect($subscription->features)
    ->contains('code', '${featureCode}');

if ($hasFeature) {
    // Allow access to ${featureTitle}
    return $next($request);
}

// Show upgrade prompt
abort(403, 'Upgrade required to access this feature');`
    },
    Python: {
      lang: 'python',
      code: `# 1. Get the user's active subscription
subscription = get_user_subscription(user_id)

# 2. Check if the subscription includes this feature
has_feature = any(
    f['code'] == '${featureCode}' 
    for f in subscription['features']
)

if has_feature:
    # Allow access to ${featureTitle}
    return render_feature()
else:
    # Show upgrade prompt
    return redirect('/upgrade')`
    }
  }
})
</script>

<template>
  <div class="max-w-[1000px] mx-auto w-full pb-12">
    <AppHeader :title="isNew ? 'New feature' : 'Edit feature'">
      <template #actions>
        <NuxtLink :to="`/${route.params.workspaceSlug}/apps/${route.params.slug}/features`">
          <Button variant="ghost" class="gap-1 cursor-pointer">
            <ArrowLeftIcon class="w-4 h-4" /> Back to features
          </Button>
        </NuxtLink>
      </template>
    </AppHeader>

    <div class="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
      <!-- Left side: Form -->
      <div class="bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-xl p-6 shadow-sm">
        <div v-if="pending && !isNew && !isInitialized" class="py-12 text-center text-[var(--muted-foreground)]">
          Loading feature details...
        </div>
        <div v-else class="space-y-6">
          <div class="space-y-2">
            <Label for="feature-name">Feature Name</Label>
            <Input id="feature-name" v-model="name" placeholder="Multiple Device Login" />
          </div>
          
          <div class="space-y-2">
            <Label for="feature-key">Code / Key</Label>
            <Input id="feature-key" v-model="key" placeholder="auth_multiple" class="font-mono" />
            <p class="text-xs text-[var(--muted-foreground)]">snake_case, auto-formatted on save. Used to check access via API.</p>
          </div>
          
          <div class="space-y-2">
            <Label for="feature-desc">Description</Label>
            <Input id="feature-desc" v-model="description" placeholder="What this feature means for the user" />
          </div>

          <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {{ errorMessage }}
          </p>

          <div class="pt-4 mt-6 border-t border-[var(--color-border-dark)] flex items-center justify-between">
            <Button class="cursor-pointer px-8" :disabled="!key.trim() || isSaving" @click="handleSave">
              {{ isSaving ? 'Saving...' : (isNew ? 'Create feature' : 'Save changes') }}
            </Button>
            <NuxtLink :to="`/${route.params.workspaceSlug}/apps/${route.params.slug}/features`">
              <Button variant="ghost" class="cursor-pointer">Cancel</Button>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Right side: Code integration snippet -->
      <div class="bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] rounded-xl overflow-hidden shadow-sm sticky top-6">
        <div class="px-4 py-3 border-b border-[var(--color-border-dark)] flex items-center gap-2 bg-[var(--color-surface)]">
          <CodeIcon class="w-4 h-4 text-[var(--color-accent)]" />
          <h3 class="text-sm font-medium text-[var(--foreground)]">Integration example</h3>
        </div>
        <div class="p-4 space-y-4">
          <p class="text-sm text-[var(--muted-foreground)]">
            Use the <code class="px-1.5 py-0.5 rounded bg-[var(--color-bg)] font-mono text-xs text-[var(--foreground)]">{{ slugifyKey(key) || 'feature_code' }}</code> key in your application code to selectively allow access based on the user's active plan.
          </p>
          
          <div class="overflow-hidden rounded-lg border border-[var(--color-border-dark)]">
            <DocsLanguageTabs :samples="codeSamples" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
