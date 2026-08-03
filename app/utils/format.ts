// app/utils/format.ts
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
