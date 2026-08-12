// app/utils/format.ts
import { useWorkspace } from '~/composables/useWorkspace'

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
