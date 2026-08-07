// app/utils/format.ts
import { useWorkspace } from '~/composables/useWorkspace'

export function formatCurrency(amount: number, currency?: string): string {
  const { workspace } = useWorkspace()
  const finalCurrency = currency || workspace.value.currency || 'XAF'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: finalCurrency.toUpperCase(),
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${finalCurrency.toUpperCase()} ${amount}`
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
