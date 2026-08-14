<!-- app/pages/apps/[slug]/plans/[id].vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
import { ArrowLeftIcon, CheckIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import AppHeader from '~/components/dashboard/AppHeader.vue'
import { toast } from 'vue-sonner'

const route = useRoute()
const { currentApp } = useApps()
const appId = computed(() => currentApp.value?.id ?? 0)

const isNew = computed(() => route.params.id === 'new')
const planId = computed(() => isNew.value ? null : Number(route.params.id))

const { plans, pending, fetchPlans, createPlan, updatePlan, attachFeature, detachFeature } = usePlans(appId)
const { features, fetchFeatures } = useFeatures(appId)

const CURRENCIES = [
  { code: 'TND', label: 'TND (DT)' },
  { code: 'NGN', label: 'NGN (₦)' },
  { code: 'ZAR', label: 'ZAR (R)' },
  { code: 'KES', label: 'KES (KSh)' },
  { code: 'GHS', label: 'GHS (₵)' },
  { code: 'EGP', label: 'EGP (E£)' },
  { code: 'MAD', label: 'MAD (MAD)' },
  { code: 'XOF', label: 'XOF (CFA)' },
  { code: 'XAF', label: 'XAF (FCFA)' },
]

const name = ref('')
const price = ref(0)
const currencyVal = ref('NGN')
const intervalVal = ref<'month' | 'year'>('month')
const yearlyDiscountVal = ref(20)
const selectedFeatureIds = ref<number[]>([])
const featureLimits = ref<Record<number, number | null>>({})

const isSaving = ref(false)
const errorMessage = ref('')
const isInitialized = ref(false)

watchEffect(() => {
  if (appId.value && !isInitialized.value && !isNew.value) {
    if (plans.value.length === 0) fetchPlans()
    if (features.value.length === 0) fetchFeatures()
  } else if (appId.value && isNew.value) {
    if (features.value.length === 0) fetchFeatures()
  }
})

watchEffect(() => {
  if (!isNew.value && plans.value.length > 0 && !isInitialized.value) {
    const existing = plans.value.find(p => p.id === planId.value)
    if (existing) {
      name.value = existing.name
      price.value = existing.price
      currencyVal.value = existing.currency || 'NGN'
      intervalVal.value = existing.duration_days >= 180 ? 'year' : 'month'
      yearlyDiscountVal.value = existing.yearly_discount_percent ?? 20
      selectedFeatureIds.value = (existing.features ?? []).map(f => {
        featureLimits.value[f.id] = f.pivot?.limit ?? null
        return f.id
      })
      isInitialized.value = true
    } else if (!pending.value) {
      navigateTo(`/${route.params.workspaceSlug}/apps/${route.params.slug}/plans`)
    }
  }
})

function toggleFeature(featureId: number) {
  const index = selectedFeatureIds.value.indexOf(featureId)
  if (index > -1) {
    selectedFeatureIds.value.splice(index, 1)
  } else {
    selectedFeatureIds.value.push(featureId)
  }
}

function isFeatureSelected(featureId: number) {
  return selectedFeatureIds.value.includes(featureId)
}

async function handleSave(publish: boolean) {
  if (!name.value.trim()) return

  isSaving.value = true
  errorMessage.value = ''
  try {
    const durationDays = intervalVal.value === 'year' ? 365 : 30
    let savedPlan
    if (!isNew.value && planId.value) {
      savedPlan = await updatePlan(planId.value, {
        name: name.value.trim(),
        price: price.value,
        currency: currencyVal.value,
        duration_days: durationDays,
        yearly_discount_percent: yearlyDiscountVal.value,
        is_active: publish,
      })
      toast.success(publish ? 'Plan published successfully' : 'Plan saved as draft')
    } else {
      savedPlan = await createPlan({
        name: name.value.trim(),
        price: price.value,
        currency: currencyVal.value,
        duration_days: durationDays,
        yearly_discount_percent: yearlyDiscountVal.value,
        is_active: publish,
      })
      toast.success(publish ? 'Plan published successfully' : 'Plan saved as draft')
    }

    // Sync feature attachments
    const currentFeatures = savedPlan.features ?? []
    const currentFeatureIds = new Set(currentFeatures.map((f: any) => f.id))
    
    // Find what to attach (new selections) or UPDATE (limit changed)
    const toAttachOrUpdate = selectedFeatureIds.value.filter((id) => {
      if (!currentFeatureIds.has(id)) return true // newly selected
      const existing = currentFeatures.find((f: any) => f.id === id)
      return existing && existing.pivot?.limit !== (featureLimits.value[id] || null) // limit changed
    })
    
    const toDetach = [...currentFeatureIds].filter((id) => !selectedFeatureIds.value.includes(id))
    
    for (const id of toAttachOrUpdate) {
      await attachFeature(savedPlan.id, id, featureLimits.value[id] || null)
    }
    for (const id of toDetach) {
      await detachFeature(savedPlan.id, id)
    }

    navigateTo(`/${route.params.workspaceSlug}/apps/${route.params.slug}/plans`)
  } catch (e) {
    errorMessage.value = extractApiErrorMessage(e)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto w-full pb-12">
    <AppHeader :title="isNew ? 'New plan' : 'Edit plan'">
      <template #actions>
        <NuxtLink :to="`/${route.params.workspaceSlug}/apps/${route.params.slug}/plans`">
          <Button variant="ghost" class="gap-1 cursor-pointer">
            <ArrowLeftIcon class="w-4 h-4" /> Back to plans
          </Button>
        </NuxtLink>
      </template>
    </AppHeader>

    <div class="bg-[var(--color-surface)] border border-[var(--color-border-dark)] rounded-xl p-6 mt-4 shadow-sm">
      <div v-if="pending && !isNew && !isInitialized" class="py-12 text-center text-[var(--muted-foreground)]">
        Loading plan details...
      </div>
      <div v-else class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="plan-name">Plan Name</Label>
            <Input id="plan-name" v-model="name" placeholder="Pro" />
          </div>

          <div class="space-y-2">
            <Label for="plan-discount">Yearly Discount (%)</Label>
            <Input id="plan-discount" v-model.number="yearlyDiscountVal" type="number" min="0" max="100" placeholder="20" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="plan-price">Price</Label>
            <Input id="plan-price" v-model.number="price" type="number" min="0" />
          </div>

          <div class="space-y-2">
            <Label for="plan-currency">Currency</Label>
            <Select v-model="currencyVal">
              <SelectTrigger id="plan-currency">
                <SelectValue placeholder="NGN" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in CURRENCIES" :key="c.code" :value="c.code">
                  {{ c.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="plan-interval">Interval</Label>
            <Select v-model="intervalVal">
              <SelectTrigger id="plan-interval">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Feature Selection Section -->
        <div class="space-y-3 pt-4 border-t border-[var(--color-border-dark)]">
          <div>
            <Label class="text-sm font-medium">Select Features</Label>
            <p class="text-xs text-[var(--muted-foreground)]">Choose which features are included in this plan</p>
          </div>

          <div v-if="features.length === 0" class="p-6 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] text-center">
            <p class="text-sm text-[var(--muted-foreground)]">No features created yet.</p>
            <NuxtLink :to="`/${$route.params.workspaceSlug}/apps/${currentApp?.slug}/features/new`" class="text-sm text-teal-600 dark:text-teal-400 hover:underline mt-2 inline-block font-medium">
              Create features first
            </NuxtLink>
          </div>

          <div v-else class="space-y-2 max-h-80 overflow-y-auto pr-2">
            <div
              v-for="feature in features"
              :key="feature.id"
              class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150"
              :class="[
                isFeatureSelected(feature.id)
                  ? 'bg-teal-500/10 border-teal-500/50 text-[var(--foreground)]'
                  : 'bg-[var(--color-surface)] border-[var(--color-border-dark)] text-[var(--foreground)] hover:border-slate-400 dark:hover:border-slate-600'
              ]"
              @click="toggleFeature(feature.id)"
            >
              <div
                class="w-5 h-5 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-colors"
                :class="[
                  isFeatureSelected(feature.id)
                    ? 'bg-teal-500 border-teal-500 text-white'
                    : 'border-[var(--color-border-dark)] bg-[var(--color-surface-muted)]'
                ]"
              >
                <CheckIcon v-if="isFeatureSelected(feature.id)" class="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div class="space-y-1 min-w-0 flex-1">
                <!-- Name on top -->
                <div class="font-medium text-sm text-[var(--foreground)] leading-tight">{{ feature.name }}</div>
                <!-- Code / Key -->
                <div class="flex items-center gap-1.5">
                  <span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono bg-[var(--color-surface-muted)] text-teal-600 dark:text-teal-400 border border-[var(--color-border-dark)]">
                    {{ feature.code }}
                  </span>
                </div>
                <!-- Description -->
                <p class="text-xs text-[var(--muted-foreground)] line-clamp-2">{{ feature.description }}</p>

                <!-- Limit Input (Only show if selected) -->
                <div v-if="isFeatureSelected(feature.id)" class="mt-3 pt-3 border-t border-[var(--color-border-dark)]" @click.stop>
                  <Label :for="`limit-${feature.id}`" class="text-xs text-[var(--muted-foreground)] mb-1.5 block">Usage Limit (optional)</Label>
                  <Input
                    :id="`limit-${feature.id}`"
                    v-model.number="featureLimits[feature.id]"
                    type="number"
                    min="0"
                    placeholder="Unlimited"
                    class="h-8 text-sm w-full max-w-[200px] bg-[var(--color-surface)]"
                  />
                  <p class="text-[10px] text-[var(--muted-foreground)] mt-1.5">Leave blank for unlimited access.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-if="errorMessage" class="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {{ errorMessage }}
        </p>

        <div class="pt-4 mt-6 border-t border-[var(--color-border-dark)] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Button class="cursor-pointer" :disabled="!name.trim() || isSaving" @click="handleSave(true)">
              {{ isSaving ? 'Publishing...' : (isNew ? 'Publish Plan' : 'Publish Changes') }}
            </Button>
            <Button variant="outline" class="cursor-pointer" :disabled="!name.trim() || isSaving" @click="handleSave(false)">
              {{ isSaving ? 'Saving...' : 'Save as Draft' }}
            </Button>
          </div>
          <NuxtLink :to="`/${route.params.workspaceSlug}/apps/${route.params.slug}/plans`">
            <Button variant="ghost" class="cursor-pointer">Cancel</Button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
