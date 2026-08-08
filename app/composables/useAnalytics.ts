// app/composables/useAnalytics.ts
import type { Subscription } from './useSubscriptions'

function bucketByMonth(subscriptions: Subscription[], value: (s: Subscription) => number) {
  const buckets = new Map<string, number>()
  for (const s of subscriptions) {
    const key = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short' })
    buckets.set(key, (buckets.get(key) ?? 0) + value(s))
  }
  return [...buckets.entries()].map(([date, amount]) => ({ date, amount }))
}

// % change between the last two populated months of a trend series, or null
// when there isn't enough history yet to compare.
function periodDelta(trend: { amount: number }[]) {
  if (trend.length < 2) return null
  const prev = trend[trend.length - 2]!.amount
  const curr = trend[trend.length - 1]!.amount
  if (prev === 0) return null
  return Math.round(((curr - prev) / prev) * 100)
}

export function useAnalytics(appId: number | string) {
  const { subscriptions, pending, error, fetchSubscriptions } = useSubscriptions(appId)

  const activeSubs = computed(() => {
    const ids = new Set(
      subscriptions.value.filter((s) => s.status === 'active').map((s) => s.subscriber_id)
    )
    return ids.size
  })

  // Subscriptions carry no amount of their own — real payment revenue lives
  // on Transactions, which the API doesn't scope to an application yet. This
  // approximates recurring revenue as active subscriptions valued at their
  // plan's price.
  const revenue = computed(() =>
    subscriptions.value
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + Number(s.plan?.price ?? 0), 0)
  )

  const transactions = computed(() => subscriptions.value.length)

  const successRate = computed(() => {
    if (transactions.value === 0) return null
    const successful = subscriptions.value.filter((s) => s.status === 'active').length
    return Math.round((successful / transactions.value) * 100)
  })

  const revenueTrend = computed(() => bucketByMonth(subscriptions.value, (s) => Number(s.plan?.price ?? 0)))
  const subscriptionTrend = computed(() => bucketByMonth(subscriptions.value, () => 1))
  const revenueDelta = computed(() => periodDelta(revenueTrend.value))
  const subscriptionsDelta = computed(() => periodDelta(subscriptionTrend.value))

  const planDistribution = computed(() => {
    const counts = new Map<string, number>()
    for (const s of subscriptions.value) {
      if (s.status !== 'active' || !s.plan) continue
      counts.set(s.plan.name, (counts.get(s.plan.name) ?? 0) + 1)
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count }))
  })

  const recentSubscriptions = computed(() =>
    [...subscriptions.value]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
  )

  return {
    activeSubs,
    revenue,
    transactions,
    successRate,
    revenueTrend,
    subscriptionTrend,
    revenueDelta,
    subscriptionsDelta,
    planDistribution,
    recentSubscriptions,
    pending,
    error,
    fetchAnalytics: fetchSubscriptions,
  }
}
