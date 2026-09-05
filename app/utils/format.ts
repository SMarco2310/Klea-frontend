// app/utils/format.ts
import { useWorkspace } from '~/composables/useWorkspace'
import type { BillingPeriod } from '~/composables/usePlans'

export function formatCurrency(amount: number, currency?: string): string {
  const { workspace } = useWorkspace()
  const finalCurrency = (currency || workspace.value.currency || 'XOF').toUpperCase()
  try {
    const formattedNum = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount)
    return `${formattedNum} ${finalCurrency}`
  } catch {
    return `${amount} ${finalCurrency}`
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Maps each billing_period enum value (never translated — it's the API
// value) to the i18n key suffix that carries its display label. The label
// text itself lives in plans.billingPeriod.displayLabels.* so it can be
// translated; this map is just plumbing between the two.
const BILLING_PERIOD_KEYS: Record<BillingPeriod, string> = {
  one_time: 'oneTime',
  monthly: 'monthly',
  quarterly: 'quarterly',
  yearly: 'yearly',
  custom: 'custom',
}

type Translator = (key: string, params?: Record<string, unknown>) => string

function dayCountLabel(t: Translator, durationDays: number): string {
  return durationDays === 1
    ? t('plans.billingPeriod.displayLabels.dayCount', { count: durationDays })
    : t('plans.billingPeriod.displayLabels.dayCountPlural', { count: durationDays })
}

/**
 * Human-readable label for a plan's billing period. Falls back to a
 * "N days" rendering for custom periods (or legacy plans that only carry
 * a duration_days value), and is null-safe: one-time plans have
 * duration_days === null.
 *
 * Utils can't call useI18n() at module scope, so the caller's own
 * translator (from useI18n() in its <script setup>) is passed in instead.
 */
export function formatBillingPeriod(billingPeriod: BillingPeriod | null | undefined, durationDays: number | null | undefined, t: Translator): string {
  if (billingPeriod === 'custom') {
    return typeof durationDays === 'number'
      ? dayCountLabel(t, durationDays)
      : t('plans.billingPeriod.displayLabels.custom')
  }
  if (billingPeriod && BILLING_PERIOD_KEYS[billingPeriod]) {
    return t(`plans.billingPeriod.displayLabels.${BILLING_PERIOD_KEYS[billingPeriod]}`)
  }
  // Fallback for plans without a billing_period (shouldn't happen post-migration,
  // but keeps display safe if the field is ever missing).
  if (typeof durationDays === 'number') {
    return dayCountLabel(t, durationDays)
  }
  return t('plans.billingPeriod.displayLabels.oneTime')
}
