<!-- app/components/plans/PlanPreviewGrid.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { CheckIcon } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { formatCurrency } from '~/utils/format'
import type { Plan } from '~/composables/usePlans'
import type { Feature } from '~/composables/useFeatures'

const props = defineProps<{
  plans: Plan[]
  features: Feature[]
}>()

const isYearly = ref(false)

// Compute display plans and calculate dynamic prices based on the plan's own yearly_discount_percent
const displayPlans = computed(() => {
  if (props.plans.length === 0) return []

  let highlightIdx = -1
  if (props.plans.length >= 2) {
    highlightIdx = 1
  } else if (props.plans.length === 1) {
    highlightIdx = 0
  }

  return props.plans.map((plan, idx) => {
    const discountPercent = plan.yearly_discount_percent ?? 0
    let displayPriceString = ''

    if (plan.price === 0) {
      displayPriceString = 'Free'
    } else if (isYearly.value) {
      const discountedMonthly = plan.price * (1 - discountPercent / 100)
      displayPriceString = `${formatCurrency(discountedMonthly, plan.currency || 'NGN')}/m`
    } else {
      displayPriceString = `${formatCurrency(plan.price, plan.currency || 'NGN')}/m`
    }

    return {
      ...plan,
      discountPercent,
      displayPrice: displayPriceString,
      highlighted: idx === highlightIdx,
      resolvedFeatures: plan.features ?? [],
    }
  })
})

// Calculate average or highest discount percentage for the toggle pill badge
const activeDiscountBadge = computed(() => {
  if (props.plans.length === 0) return 0
  const discounts = props.plans.map((p) => p.yearly_discount_percent ?? 0)
  return Math.max(...discounts)
})

</script>

<template>
  <div class="flex flex-col items-center w-full py-6">
    <!-- Empty state for preview -->
    <div
      v-if="plans.length === 0"
      class="p-12 text-center rounded-[2.5rem] bg-[var(--color-surface-muted)] border border-[var(--color-border-dark)] w-full max-w-xl my-8"
    >
      <p class="text-[var(--muted-foreground)] text-sm">No plans available to preview. Switch to List view to create your first plan.</p>
    </div>

    <template v-else>
      <!-- Pricing Cards Grid matching screenshot -->
      <div
        class="grid grid-cols-1 gap-6 w-full mt-4"
        :class="{
          'md:grid-cols-1 max-w-md': plans.length === 1,
          'md:grid-cols-2 max-w-3xl': plans.length === 2,
          'md:grid-cols-3 max-w-6xl': plans.length >= 3,
        }"
      >
        <div
          v-for="plan in displayPlans"
          :key="plan.id"
          class="glass-panel p-8 rounded-[2rem] flex flex-col relative transition-transform duration-300 hover:scale-[1.02] h-full"
          :class="
            plan.highlighted
              ? 'border-[color:var(--color-accent)]/50 bg-[color:var(--color-accent)]/10 shadow-2xl'
              : 'bg-[var(--color-surface)]/60 border border-[color:var(--color-border-dark)]'
          "
        >
          <!-- Plan Header -->
          <div class="mb-8">
            <p class="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider text-xs">
              {{ plan.name.toLowerCase().endsWith('plan') ? plan.name : `${plan.name} Plan` }}
            </p>
            <div class="flex flex-col gap-1 mt-1">
              <h3 class="font-heading text-4xl font-extrabold text-foreground tracking-tight drop-shadow-sm">
                {{ plan.displayPrice }}
              </h3>
              <span v-if="isYearly && plan.price > 0" class="text-xs text-[color:var(--color-accent)] font-semibold mt-1">
                (billed yearly<template v-if="plan.discountPercent > 0"> - {{ plan.discountPercent }}% off</template>)
              </span>
            </div>
          </div>

          <!-- Feature List -->
          <div class="mb-10 flex-grow relative">
            <div
              v-if="plan.resolvedFeatures.length === 0"
              class="text-sm text-muted-foreground italic py-2"
            >
              No features assigned to this plan
            </div>
            <ul v-else class="space-y-4">
              <li
                v-for="feature in plan.resolvedFeatures"
                :key="feature.id"
                class="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <div class="mt-0.5 bg-foreground/10 p-0.5 rounded-full shrink-0 flex items-center justify-center h-4 w-4">
                  <CheckIcon class="w-3 h-3 text-foreground" />
                </div>
                <div>
                  <span class="font-semibold text-foreground transition-colors">{{ feature.name }}</span>
                  <span v-if="feature.description" class="block text-[13px] text-muted-foreground mt-1 leading-relaxed">
                    {{ feature.description }}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <!-- Action Button -->
          <Button
            class="w-full rounded-full py-6 text-sm font-semibold transition-colors cursor-pointer"
            :class="
              plan.highlighted
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-emerald-950/20'
                : 'bg-transparent text-foreground hover:bg-foreground/5 border border-[color:var(--color-border-dark)]'
            "
          >
            Get Started
          </Button>
        </div>
      </div>

      <!-- Yearly / Monthly Toggle -->
      <div class="flex justify-center mt-12 select-none">
        <div class="inline-flex items-center p-1.5 bg-[var(--color-surface)]/80 rounded-full border border-[color:var(--color-border-dark)] shadow-xl backdrop-blur-md">
          <button
            type="button"
            @click="isYearly = false"
            class="px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
            :class="!isYearly ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'"
          >
            Monthly
          </button>
          <button
            type="button"
            @click="isYearly = true"
            class="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
            :class="isYearly ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'"
          >
            Annually
            <span v-if="activeDiscountBadge > 0" class="px-2.5 py-0.5 text-[11px] font-bold rounded-md shadow-sm border border-primary/20" :class="isYearly ? 'bg-white/20 text-white' : 'bg-primary text-primary-foreground'">
              Save {{ activeDiscountBadge }}%
            </span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
