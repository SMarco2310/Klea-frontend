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

const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  one_time: 'One-time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  custom: 'Custom',
}

/**
 * Human-readable label for a plan's billing period. Falls back to a
 * "N days" rendering for custom periods (or legacy plans that only carry
 * a duration_days value), and is null-safe: one-time plans have
 * duration_days === null.
 */
export function formatBillingPeriod(billingPeriod: BillingPeriod | null | undefined, durationDays: number | null | undefined): string {
  if (billingPeriod === 'custom') {
    return typeof durationDays === 'number' ? `${durationDays} day${durationDays === 1 ? '' : 's'}` : 'Custom'
  }
  if (billingPeriod && BILLING_PERIOD_LABELS[billingPeriod]) {
    return BILLING_PERIOD_LABELS[billingPeriod]
  }
  // Fallback for plans without a billing_period (shouldn't happen post-migration,
  // but keeps display safe if the field is ever missing).
  if (typeof durationDays === 'number') {
    return `${durationDays} day${durationDays === 1 ? '' : 's'}`
  }
  return 'One-time'
}
